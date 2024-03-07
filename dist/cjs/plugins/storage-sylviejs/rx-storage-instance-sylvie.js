"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RxStorageInstanceSylvie = void 0;
exports.createSylvieLocalState = createSylvieLocalState;
exports.createSylvieStorageInstance = createSylvieStorageInstance;
var _rxjs = require("rxjs");
var _index = require("../utils/index.js");
var _rxError = require("../../rx-error.js");
var _sylviejsHelper = require("./sylviejs-helper.js");
var _rxSchemaHelper = require("../../rx-schema-helper.js");
var _rxStorageHelper = require("../../rx-storage-helper.js");
var _rxStorageMultiinstance = require("../../rx-storage-multiinstance.js");
var _rxQueryHelper = require("../../rx-query-helper.js");
var instanceId = (0, _index.now)();
var RxStorageInstanceSylvie = exports.RxStorageInstanceSylvie = /*#__PURE__*/function () {
  function RxStorageInstanceSylvie(databaseInstanceToken, storage, databaseName, collectionName, schema, internals, options, databaseSettings) {
    this.changes$ = new _rxjs.Subject();
    this.instanceId = instanceId++;
    this.databaseInstanceToken = databaseInstanceToken;
    this.storage = storage;
    this.databaseName = databaseName;
    this.collectionName = collectionName;
    this.schema = schema;
    this.internals = internals;
    this.options = options;
    this.databaseSettings = databaseSettings;
    this.primaryPath = (0, _rxSchemaHelper.getPrimaryFieldOfPrimaryKey)(this.schema.primaryKey);
    _sylviejsHelper.OPEN_SYLVIEJS_STORAGE_INSTANCES.add(this);
    if (this.internals.leaderElector) {
      /**
       * To run handleRemoteRequest(),
       * the instance will call its own methods.
       * But these methods could have already been swapped out by a RxStorageWrapper
       * so we must store the original methods here and use them instead.
       */
      var copiedSelf = {
        bulkWrite: this.bulkWrite.bind(this),
        changeStream: this.changeStream.bind(this),
        cleanup: this.cleanup.bind(this),
        close: this.close.bind(this),
        query: this.query.bind(this),
        count: this.count.bind(this),
        findDocumentsById: this.findDocumentsById.bind(this),
        collectionName: this.collectionName,
        databaseName: this.databaseName,
        conflictResultionTasks: this.conflictResultionTasks.bind(this),
        getAttachmentData: this.getAttachmentData.bind(this),
        internals: this.internals,
        options: this.options,
        remove: this.remove.bind(this),
        resolveConflictResultionTask: this.resolveConflictResultionTask.bind(this),
        schema: this.schema
      };
      this.internals.leaderElector.awaitLeadership().then(() => {
        // this instance is leader now, so it has to reply to queries from other instances
        (0, _index.ensureNotFalsy)(this.internals.leaderElector).broadcastChannel.addEventListener('message', msg => (0, _sylviejsHelper.handleRemoteRequest)(copiedSelf, msg));
      }).catch(() => {});
    }
  }
  var _proto = RxStorageInstanceSylvie.prototype;
  _proto.bulkWrite = async function bulkWrite(documentWrites, context) {
    if (documentWrites.length === 0) {
      throw (0, _rxError.newRxError)('P2', {
        args: {
          documentWrites
        }
      });
    }
    var localState = await (0, _sylviejsHelper.mustUseLocalState)(this);
    if (!localState) {
      return (0, _sylviejsHelper.requestRemoteInstance)(this, 'bulkWrite', [documentWrites]);
    }
    var ret = {
      success: [],
      error: []
    };
    var docsInDb = new Map();
    var docsInDbWithSylvieKey = new Map();
    documentWrites.forEach(writeRow => {
      var id = writeRow.document[this.primaryPath];
      var documentInDb = localState.collection.by(this.primaryPath, id);
      if (documentInDb) {
        docsInDbWithSylvieKey.set(id, documentInDb);
        docsInDb.set(id, (0, _sylviejsHelper.stripSylvieKey)(documentInDb));
      }
    });
    var categorized = (0, _rxStorageHelper.categorizeBulkWriteRows)(this, this.primaryPath, docsInDb, documentWrites, context);
    ret.error = categorized.errors;
    categorized.bulkInsertDocs.forEach(writeRow => {
      localState.collection.insert((0, _index.flatClone)(writeRow.document));
      ret.success.push(writeRow.document);
    });
    categorized.bulkUpdateDocs.forEach(writeRow => {
      var docId = writeRow.document[this.primaryPath];
      var documentInDbWithSylvieKey = (0, _index.getFromMapOrThrow)(docsInDbWithSylvieKey, docId);
      var writeDoc = Object.assign({}, writeRow.document, {
        $loki: documentInDbWithSylvieKey.$loki
      });
      localState.collection.update(writeDoc);
      ret.success.push(writeRow.document);
    });
    localState.databaseState.saveQueue.addWrite();
    if (categorized.eventBulk.events.length > 0) {
      var lastState = (0, _index.ensureNotFalsy)(categorized.newestRow).document;
      categorized.eventBulk.checkpoint = {
        id: lastState[this.primaryPath],
        lwt: lastState._meta.lwt
      };
      categorized.eventBulk.endTime = (0, _index.now)();
      this.changes$.next(categorized.eventBulk);
    }
    return ret;
  };
  _proto.findDocumentsById = async function findDocumentsById(ids, deleted) {
    var localState = await (0, _sylviejsHelper.mustUseLocalState)(this);
    if (!localState) {
      return (0, _sylviejsHelper.requestRemoteInstance)(this, 'findDocumentsById', [ids, deleted]);
    }
    var ret = [];
    ids.forEach(id => {
      var documentInDb = localState.collection.by(this.primaryPath, id);
      if (documentInDb && (!documentInDb._deleted || deleted)) {
        ret.push((0, _sylviejsHelper.stripSylvieKey)(documentInDb));
      }
    });
    return ret;
  };
  _proto.query = async function query(preparedQueryOriginal) {
    var localState = await (0, _sylviejsHelper.mustUseLocalState)(this);
    if (!localState) {
      return (0, _sylviejsHelper.requestRemoteInstance)(this, 'query', [preparedQueryOriginal]);
    }
    var preparedQuery = (0, _index.ensureNotFalsy)(preparedQueryOriginal.query);
    if (preparedQuery.selector) {
      preparedQuery = (0, _index.flatClone)(preparedQuery);
      preparedQuery.selector = (0, _sylviejsHelper.transformRegexToRegExp)(preparedQuery.selector);
    }
    var query = preparedQueryOriginal.query;
    var skip = query.skip ? query.skip : 0;
    var limit = query.limit ? query.limit : Infinity;
    var skipPlusLimit = skip + limit;

    /**
     * SylvieJS is not able to give correct results for some
     * operators, so we have to check all documents in that case
     * and laster apply skip and limit manually.
     * @link https://github.com/pubkey/rxdb/issues/5320
     */
    var mustRunMatcher = false;
    if ((0, _index.hasDeepProperty)(preparedQuery.selector, '$in')) {
      mustRunMatcher = true;
    }
    var sylvieQuery = localState.collection.chain().find(mustRunMatcher ? {} : preparedQuery.selector);
    if (preparedQuery.sort) {
      sylvieQuery = sylvieQuery.sort((0, _sylviejsHelper.getSylvieSortComparator)(this.schema, preparedQuery));
    }

    /**
     * Offset must be used before limit in SylvieJS
     * @link https://github.com/techfort/SylvieJS/issues/570
     */
    if (!mustRunMatcher && preparedQuery.skip) {
      sylvieQuery = sylvieQuery.offset(preparedQuery.skip);
    }
    if (!mustRunMatcher && preparedQuery.limit) {
      sylvieQuery = sylvieQuery.limit(preparedQuery.limit);
    }
    var foundDocuments = sylvieQuery.data().map(sylvieDoc => (0, _sylviejsHelper.stripSylvieKey)(sylvieDoc));

    /**
     * SylvieJS returned wrong results on some queries
     * with complex indexes. Therefore we run the query-match
     * over all result docs to patch this bug.
     * TODO create an issue at the SylvieJS repository.
     */
    var queryMatcher = (0, _rxQueryHelper.getQueryMatcher)(this.schema, preparedQuery);
    foundDocuments = foundDocuments.filter(d => queryMatcher(d));
    if (mustRunMatcher) {
      foundDocuments = foundDocuments.slice(skip, skipPlusLimit);
    }
    return {
      documents: foundDocuments
    };
  };
  _proto.count = async function count(preparedQuery) {
    var result = await this.query(preparedQuery);
    return {
      count: result.documents.length,
      mode: 'fast'
    };
  };
  _proto.getAttachmentData = function getAttachmentData(_documentId, _attachmentId, _digest) {
    throw new Error('Attachments are not implemented in the sylviejs RxStorage. Make a pull request.');
  };
  _proto.changeStream = function changeStream() {
    return this.changes$.asObservable();
  };
  _proto.cleanup = async function cleanup(minimumDeletedTime) {
    var localState = await (0, _sylviejsHelper.mustUseLocalState)(this);
    if (!localState) {
      return (0, _sylviejsHelper.requestRemoteInstance)(this, 'cleanup', [minimumDeletedTime]);
    }
    var deleteAmountPerRun = 10;
    var maxDeletionTime = (0, _index.now)() - minimumDeletedTime;
    var query = localState.collection.chain().find({
      _deleted: true,
      '_meta.lwt': {
        $lt: maxDeletionTime
      }
    }).limit(deleteAmountPerRun);
    var foundDocuments = query.data();
    if (foundDocuments.length > 0) {
      localState.collection.remove(foundDocuments);
      localState.databaseState.saveQueue.addWrite();
    }
    return foundDocuments.length !== deleteAmountPerRun;
  };
  _proto.close = async function close() {
    if (this.closed) {
      return this.closed;
    }
    this.closed = (async () => {
      this.changes$.complete();
      _sylviejsHelper.OPEN_SYLVIEJS_STORAGE_INSTANCES.delete(this);
      if (this.internals.localState) {
        var localState = await this.internals.localState;
        var dbState = await (0, _sylviejsHelper.getSylvieDatabase)(this.databaseName, this.databaseSettings);
        await dbState.saveQueue.run();
        await (0, _sylviejsHelper.closeSylvieCollections)(this.databaseName, [localState.collection]);
      }
    })();
    return this.closed;
  };
  _proto.remove = async function remove() {
    var localState = await (0, _sylviejsHelper.mustUseLocalState)(this);
    if (!localState) {
      return (0, _sylviejsHelper.requestRemoteInstance)(this, 'remove', []);
    }
    localState.databaseState.database.removeCollection(localState.collection.name);
    await localState.databaseState.saveQueue.run();
    return this.close();
  };
  _proto.conflictResultionTasks = function conflictResultionTasks() {
    return new _rxjs.Subject();
  };
  _proto.resolveConflictResultionTask = async function resolveConflictResultionTask(_taskSolution) {};
  return RxStorageInstanceSylvie;
}();
async function createSylvieLocalState(params, databaseSettings) {
  if (!params.options) {
    params.options = {};
  }
  var databaseState = await (0, _sylviejsHelper.getSylvieDatabase)(params.databaseName, databaseSettings);

  /**
   * Construct sylvie indexes from RxJsonSchema indexes.
   * TODO what about compound indexes? Are they possible in sylviejs?
   */
  var indices = [];
  if (params.schema.indexes) {
    params.schema.indexes.forEach(idx => {
      if (!(0, _index.isMaybeReadonlyArray)(idx)) {
        indices.push(idx);
      }
    });
  }
  /**
   * SylvieJS has no concept of custom primary key, they use a number-id that is generated.
   * To be able to query fast by primary key, we always add an index to the primary.
   */
  var primaryKey = (0, _rxSchemaHelper.getPrimaryFieldOfPrimaryKey)(params.schema.primaryKey);
  indices.push(primaryKey);
  var sylvieCollectionName = params.collectionName + '-' + params.schema.version;
  var collectionOptions = Object.assign({}, sylvieCollectionName, {
    indices: indices,
    unique: [primaryKey]
  }, _sylviejsHelper.SYLVIEJS_COLLECTION_DEFAULT_OPTIONS);
  var collection = databaseState.database.addCollection(sylvieCollectionName, collectionOptions);
  databaseState.collections[params.collectionName] = collection;
  var ret = {
    databaseState,
    collection
  };
  return ret;
}
async function createSylvieStorageInstance(storage, params, databaseSettings) {
  var internals = {};
  var broadcastChannelRefObject = {};
  if (params.multiInstance) {
    var leaderElector = (0, _sylviejsHelper.getSylvieLeaderElector)(params.databaseInstanceToken, broadcastChannelRefObject, params.databaseName);
    internals.leaderElector = leaderElector;
  } else {
    // optimisation shortcut, directly create db is non multi instance.
    internals.localState = createSylvieLocalState(params, databaseSettings);
    await internals.localState;
  }
  var instance = new RxStorageInstanceSylvie(params.databaseInstanceToken, storage, params.databaseName, params.collectionName, params.schema, internals, params.options, databaseSettings);
  await (0, _rxStorageMultiinstance.addRxStorageMultiInstanceSupport)(_sylviejsHelper.RX_STORAGE_NAME_SYLVIEJS, params, instance, internals.leaderElector ? internals.leaderElector.broadcastChannel : undefined);
  if (params.multiInstance) {
    /**
     * Clean up the broadcast-channel reference on close()
     */
    var closeBefore = instance.close.bind(instance);
    instance.close = function () {
      (0, _rxStorageMultiinstance.removeBroadcastChannelReference)(params.databaseInstanceToken, broadcastChannelRefObject);
      return closeBefore();
    };
    var removeBefore = instance.remove.bind(instance);
    instance.remove = function () {
      (0, _rxStorageMultiinstance.removeBroadcastChannelReference)(params.databaseInstanceToken, broadcastChannelRefObject);
      return removeBefore();
    };

    /**
     * Directly create the localState when/if the db becomes leader.
     */
    (0, _index.ensureNotFalsy)(internals.leaderElector).awaitLeadership().then(() => {
      if (!instance.closed) {
        (0, _sylviejsHelper.mustUseLocalState)(instance);
      }
    });
  }
  return instance;
}
//# sourceMappingURL=rx-storage-instance-sylvie.js.map