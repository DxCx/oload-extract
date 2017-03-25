/**
 * @param {string} str
 * @return {?}
 */
function openloadExtract(pageContent) {
  /** @type {number} */
  var fromIndex = pageContent.indexOf("streamurl") - 18;
  var progress = pageContent.lastIndexOf(">", fromIndex) + 1;

  var location = pageContent.substring(progress, fromIndex);
  var currentIndex = location.charCodeAt(0);
  var fragment = currentIndex - 52;
  var args = Math.max(2, fragment);

  fragment = Math.min(args, location.length - 30 - 2);

  var scripts = location.substring(fragment, fragment + 30);
  /** @type {Array} */
  var parts = new Array(10);
  /** @type {number} */
  var key = 0;
  while (key < scripts.length) {
    var camelKey = scripts.substring(key, key + 3);
    parts[key / 3] = parseInt(camelKey, 8);
    key += 3;
  }

  var original = location.split("");

  original.splice(fragment, 30);

  var obj = original.join("");
  /** @type {Array} */
  var clrs = [];

  /** @type {number} */
  key = 0;

  /** @type {number} */
  for (var widgetPartAttribute = 0; key < obj.length; widgetPartAttribute += 1) {
    var values = obj.substring(key, key + 2);
    var value = obj.substring(key, key + 3);
    var node = obj.substring(key, key + 4);
    var ret = parseInt(values, 16);
    key += 2;
    if (widgetPartAttribute % 3 === 0) {
      ret = parseInt(value, 8);
      key += 1;
    } else {
      if (widgetPartAttribute % 2 === 0) {
        if (0 !== widgetPartAttribute) {
          if (obj[widgetPartAttribute - 1].charCodeAt(0) < 60) {
            ret = parseInt(node, 10);
            key += 2;
          }
        }
      }
    }
    var spaceAfter = parts[widgetPartAttribute % 9];
    ret ^= 213;
    ret ^= spaceAfter;
    clrs.push(String.fromCharCode(ret));
  }

  return "https://openload.co/stream/" + clrs.join("") + "?mime=true";
};

module.exports = { openloadExtract: openloadExtract };
