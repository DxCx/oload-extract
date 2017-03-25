/**
 * @param {string} str
 * @return {?}
 */
function openloadExtract(str) {
  /** @type {number} */
  var fromIndex = str.indexOf("streamurl") - 18;
  var progress = str.lastIndexOf(">", fromIndex) + 1;
  var calls = {
    /**
     * @param {(boolean|number|string)} dataAndEvents
     * @param {(boolean|number|string)} deepDataAndEvents
     * @return {?}
     */
    "xRD" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents < deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "ZeT" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents + deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "WNS" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents + deepDataAndEvents;
    },
    /**
     * @param {?} callback
     * @param {?} events
     * @param {?} deepDataAndEvents
     * @return {?}
     */
    "BOg" : function clone(callback, events, deepDataAndEvents) {
      return callback(events, deepDataAndEvents);
    },
    /**
     * @param {?} dataAndEvents
     * @param {?} deepDataAndEvents
     * @return {?}
     */
    "wqo" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents == deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "tVi" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents % deepDataAndEvents;
    },
    /**
     * @param {?} dataAndEvents
     * @param {?} deepDataAndEvents
     * @return {?}
     */
    "OLB" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents == deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "rZh" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents % deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "bqe" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents != deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "yfs" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents - deepDataAndEvents;
    },
    /**
     * @param {?} callback
     * @param {?} events
     * @param {?} deepDataAndEvents
     * @return {?}
     */
    "FxE" : function clone(callback, events, deepDataAndEvents) {
      return callback(events, deepDataAndEvents);
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "MEA" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents % deepDataAndEvents;
    },
    /**
     * @param {(boolean|number|string)} dataAndEvents
     * @param {(boolean|number|string)} deepDataAndEvents
     * @return {?}
     */
    "TYf" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents < deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "XcK" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents / deepDataAndEvents;
    },
    /**
     * @param {?} callback
     * @param {?} events
     * @param {?} deepDataAndEvents
     * @return {?}
     */
    "dFN" : function clone(callback, events, deepDataAndEvents) {
      return callback(events, deepDataAndEvents);
    },
    /**
     * @param {?} freezeObject
     * @param {?} object
     * @return {?}
     */
    "XzN" : function freeze(freezeObject, object) {
      return freezeObject(object);
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "EKC" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents - deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "oIa" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents - deepDataAndEvents;
    }
  };
  var res = "3|6|2|7|4|0|5|1|8"["split"]("|");
  /** @type {number} */
  var resLength = 0;
  for (;!![];) {
    switch(res[resLength++]) {
      case "0":
        var obj = original["join"]("");
        /** @type {Array} */
        var clrs = [];
        continue;
      case "1":
        /** @type {number} */
        var widgetPartAttribute = 0;
        for (;calls["xRD"](key, obj["length"]);) {
          var values = obj["substring"](key, calls["ZeT"](key, 2));
          var value = obj["substring"](key, calls["WNS"](key, 3));
          var node = obj["substring"](key, calls["WNS"](key, 4));
          var ret = calls["BOg"](parseInt, values, 16);
          key += 2;
          if (calls["wqo"](calls["tVi"](widgetPartAttribute, 3), 0)) {
            ret = calls["BOg"](parseInt, value, 8);
            key += 1;
          } else {
            if (calls["OLB"](calls["rZh"](widgetPartAttribute, 2), 0)) {
              if (calls["bqe"](0, widgetPartAttribute)) {
                if (calls["xRD"](obj[calls["yfs"](widgetPartAttribute, 1)]["charCodeAt"](0), 60)) {
                  ret = calls["FxE"](parseInt, node, 10);
                  key += 2;
                }
              }
            }
          }
          var spaceAfter = parts[calls["MEA"](widgetPartAttribute, 9)];
          ret ^= 213;
          ret ^= spaceAfter;
          clrs["push"](String["fromCharCode"](ret));
          widgetPartAttribute += 1;
        }
        continue;
      case "2":
        var scripts = location["substring"](fragment, calls["WNS"](fragment, 30));
        /** @type {Array} */
        var parts = new Array(10);
        /** @type {number} */
        var key = 0;
        for (;calls["TYf"](key, scripts["length"]);) {
          var camelKey = scripts["substring"](key, calls["WNS"](key, 3));
          parts[calls["XcK"](key, 3)] = calls["dFN"](parseInt, camelKey, 8);
          key += 3;
        }
        continue;
      case "3":
        var location = str.substring(progress, fromIndex);
        var currentIndex = location["charCodeAt"](0);
        var fragment = calls["EKC"](currentIndex, 52);
        var args = Math["max"](2, fragment);
        continue;
      case "4":
        original["splice"](fragment, 30);
        continue;
      case "5":
        /** @type {number} */
        key = 0;
        continue;
      case "6":
        fragment = Math["min"](args, calls["oIa"](calls["oIa"](location["length"], 30), 2));
        continue;
      case "7":
        var original = location["split"]("");
        continue;
      case "8":
        return "https://openload.co/stream/" + clrs.join("") + "?mime=true";
    }
    break;
  }
};

module.exports = { openloadExtract: openloadExtract };
