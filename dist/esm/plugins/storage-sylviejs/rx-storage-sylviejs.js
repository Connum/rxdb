import { createSylvieStorageInstance } from "./rx-storage-instance-sylvie.js";
import { RX_STORAGE_NAME_SYLVIEJS } from "./sylviejs-helper.js";
import { ensureRxStorageInstanceParamsAreCorrect } from "../../rx-storage-helper.js";
import { RXDB_VERSION } from "../utils/utils-rxdb-version.js";
export var RxStorageSylvie = /*#__PURE__*/function () {
  /**
   * Create one leader elector by db name.
   * This is done inside of the storage, not globally
   * to make it easier to test multi-tab behavior.
   */

  function RxStorageSylvie(databaseSettings) {
    this.name = RX_STORAGE_NAME_SYLVIEJS;
    this.rxdbVersion = RXDB_VERSION;
    this.leaderElectorBySylvieDbName = new Map();
    this.databaseSettings = databaseSettings;
  }
  var _proto = RxStorageSylvie.prototype;
  _proto.createStorageInstance = function createStorageInstance(params) {
    ensureRxStorageInstanceParamsAreCorrect(params);
    return createSylvieStorageInstance(this, params, this.databaseSettings);
  };
  return RxStorageSylvie;
}();
export function getRxStorageSylvie(databaseSettings = {}) {
  var storage = new RxStorageSylvie(databaseSettings);
  return storage;
}
//# sourceMappingURL=rx-storage-sylviejs.js.map