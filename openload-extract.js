/**
 * @param {string} str
 * @return {?}
 */
function openloadExtract(pageContent) {
  /** @type {number} */
  var length = pageContent.indexOf("streamurl") - 18;
  var index = pageContent.lastIndexOf(">", length) + 1;
  var ol_id = pageContent.substring(index, length);
  var arrow = ol_id.charCodeAt(0);
  /** @type {number} */
  var pos = arrow - 52;
  /** @type {number} */
  var nextOpen = Math.max(2, pos);
  /** @type {number} */
  pos = Math.min(nextOpen, ol_id.length - 30 - 2);
  var part = ol_id.substring(pos, pos + 30);
  /** @type {Array} */
  var arr = new Array(10);
  /** @type {number} */
	var i = 0
  for (; i < part.length; i += 3) {
    var id = part.substring(i, i + 3);
    /** @type {number} */
    arr[i / 3] = parseInt(id, 8);
  }
  var chars = ol_id.split("");
  chars.splice(pos, 30);
  var a = chars.join("");
  /** @type {Array} */
  var tagNameArr = [];
  /** @type {number} */
  i = 0;
  /** @type {number} */
  for (var n = 0; i < a.length; n += 1) {
    var text = a.substring(i, i + 2);
    var cDigit = a.substring(i, i + 3);
    var ch = a.substring(i, i + 4);
    /** @type {number} */
    var code = parseInt(text, 16);
    i += 2;
    if (n % 3 === 0) {
      /** @type {number} */
      code = parseInt(cDigit, 8);
      i += 1;
    } else {
      if (n % 2 === 0) {
        if (0 !== n) {
          if (a[n - 1].charCodeAt(0) < 60) {
            /** @type {number} */
            code = parseInt(ch, 10);
            i += 2;
          }
        }
      }
    }
    var val = arr[n % 9];
    code ^= 213;
    code ^= val;
    tagNameArr.push(String.fromCharCode(code));
  }
  return "https://openload.co/stream/" + tagNameArr.join("") + "?mime=true";
};

module.exports = { openloadExtract: openloadExtract };
