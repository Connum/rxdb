"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _rxStorageSylviejs = require("./rx-storage-sylviejs.js");
Object.keys(_rxStorageSylviejs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _rxStorageSylviejs[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _rxStorageSylviejs[key];
    }
  });
});
var _sylviejsHelper = require("./sylviejs-helper.js");
Object.keys(_sylviejsHelper).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _sylviejsHelper[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _sylviejsHelper[key];
    }
  });
});
var _rxStorageInstanceSylvie = require("./rx-storage-instance-sylvie.js");
Object.keys(_rxStorageInstanceSylvie).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _rxStorageInstanceSylvie[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _rxStorageInstanceSylvie[key];
    }
  });
});
//# sourceMappingURL=index.js.map