"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RxStorageSylvie = void 0;
exports.getRxStorageSylvie = getRxStorageSylvie;
var _rxStorageInstanceSylvie = require("./rx-storage-instance-sylvie.js");
var _sylviejsHelper = require("./sylviejs-helper.js");
var _rxStorageHelper = require("../../rx-storage-helper.js");
var _utilsRxdbVersion = require("../utils/utils-rxdb-version.js");
var RxStorageSylvie = exports.RxStorageSylvie = /*#__PURE__*/function () {
  /**
   * Create one leader elector by db name.
   * This is done inside of the storage, not globally
   * to make it easier to test multi-tab behavior.
   */

  function RxStorageSylvie(databaseSettings) {
    this.name = _sylviejsHelper.RX_STORAGE_NAME_SYLVIEJS;
    this.rxdbVersion = _utilsRxdbVersion.RXDB_VERSION;
    this.leaderElectorBySylvieDbName = new Map();
    this.databaseSettings = databaseSettings;
  }
  var _proto = RxStorageSylvie.prototype;
  _proto.createStorageInstance = function createStorageInstance(params) {
    (0, _rxStorageHelper.ensureRxStorageInstanceParamsAreCorrect)(params);
    return (0, _rxStorageInstanceSylvie.createSylvieStorageInstance)(this, params, this.databaseSettings);
  };
  return RxStorageSylvie;
}();
function getRxStorageSylvie(databaseSettings = {}) {
  var storage = new RxStorageSylvie(databaseSettings);
  return storage;
}
//# sourceMappingURL=rx-storage-sylviejs.js.map