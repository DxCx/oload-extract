/**
 * @param {string} str
 * @return {?}
 */
function openloadExtract(pageContent) {
  /** @type {number} */
  var fromIndex = pageContent.indexOf("streamurl") - 18;
  var progress = pageContent.lastIndexOf(">", fromIndex) + 1;
  var calls = {
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "neq" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents != deepDataAndEvents;
    },
    /**
     * @param {?} dataAndEvents
     * @param {?} deepDataAndEvents
     * @return {?}
     */
    "eq" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents == deepDataAndEvents;
    },
    /**
     * @param {(boolean|number|string)} dataAndEvents
     * @param {(boolean|number|string)} deepDataAndEvents
     * @return {?}
     */
    "lt" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents < deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "add" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents + deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "modulo" : function clone(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents % deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "div" : function div(dataAndEvents, deepDataAndEvents) {
      return dataAndEvents / deepDataAndEvents;
    },
    /**
     * @param {number} dataAndEvents
     * @param {number} deepDataAndEvents
     * @return {?}
     */
    "sub" : function (dataAndEvents, deepDataAndEvents) {
      return dataAndEvents - deepDataAndEvents;
    },
  };

  /** @type {number} */
  var steps = "3|6|2|7|4|0|5|1|8".split("|");
  for (var i = 0; i < steps.length; i++) {
    switch(steps[i]) {
      case "3":
        var location = pageContent.substring(progress, fromIndex);
        var currentIndex = location.charCodeAt(0);
        var fragment = calls["sub"](currentIndex, 52);
        var args = Math.max(2, fragment);
        continue;

      case "6":
        fragment = Math.min(args, calls["sub"](calls["sub"](location.length, 30), 2));
        continue;

      case "2":
        var scripts = location.substring(fragment, calls["add"](fragment, 30));
        /** @type {Array} */
        var parts = new Array(10);
        /** @type {number} */
        var key = 0;
        while (calls["lt"](key, scripts.length)) {
          var camelKey = scripts.substring(key, calls["add"](key, 3));
          parts[calls["div"](key, 3)] = parseInt(camelKey, 8);
          key += 3;
        }
        continue;

      case "7":
        var original = location.split("");
        continue;

      case "4":
        original.splice(fragment, 30);
        continue;

      case "0":
        var obj = original.join("");
        /** @type {Array} */
        var clrs = [];
        continue;

      case "5":
        /** @type {number} */
        key = 0;
        continue;

      case "1":
        /** @type {number} */
        var widgetPartAttribute = 0;
        for (;calls["lt"](key, obj.length);) {
          var values = obj.substring(key, calls["add"](key, 2));
          var value = obj.substring(key, calls["add"](key, 3));
          var node = obj.substring(key, calls["add"](key, 4));
          var ret = parseInt(values, 16);
          key += 2;
          if (calls["eq"](calls["modulo"](widgetPartAttribute, 3), 0)) {
            ret = parseInt(value, 8);
            key += 1;
          } else {
            if (calls["eq"](calls["modulo"](widgetPartAttribute, 2), 0)) {
              if (calls["bqe"](0, widgetPartAttribute)) {
                if (calls["lt"](obj[calls["sub"](widgetPartAttribute, 1)]["charCodeAt"](0), 60)) {
                  ret = parseInt(node, 10);
                  key += 2;
                }
              }
            }
          }
          var spaceAfter = parts[calls["modulo"](widgetPartAttribute, 9)];
          ret ^= 213;
          ret ^= spaceAfter;
          clrs.push(String.fromCharCode(ret));
          widgetPartAttribute += 1;
        }
        continue;

      case "8":
        return "https://openload.co/stream/" + clrs.join("") + "?mime=true";
    }
    break;
  }
};

module.exports = { openloadExtract: openloadExtract };
