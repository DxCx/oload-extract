const request = require('request');
const beautify = require('js-beautify').js_beautify;
const vm = require('vm');

function decodeEscapeSequance(str) {
  return str.replace(/\\x([0-9A-Fa-f]{2})/g, function() {
    return String.fromCharCode(parseInt(arguments[1], 16));
  });
}

function unpackStringArr(js) {
  let curJs = js.split('\n');
  const strArr = curJs.shift();
  // Read the table
  const [_1, varName, strTableString] = strArr.match(/var\s(.+?)\s=\s(.+?);$/);
  const strTable = eval(strTableString);

  // Read the rotate function param and mimic
  let rotateCount = 0;
  let line = '';
  while(line = curJs.shift()) {
    const matchObj = line.match(new RegExp(`\\}\\(${varName}, (0x.+?)\\)\\)`));
    if (!matchObj) {
      continue;
    }

    rotateCount = (parseInt(matchObj[1], 16)) + 1;
    break;
  }

  while(--rotateCount) {
    strTable.push(strTable.shift());
  }

  // read the jump resolver variable
  const jumpFunc = curJs.shift();
  const [_3, jumpFuncVarName] = jumpFunc.match(/var\s(.+?)\s=/);
  while(line = curJs.shift()) {
    if (line[0] === '$') {
      curJs.unshift(line);
      break;
    }
  }

  // Replace all jump calls with actual value
  const tableRegex = `${jumpFuncVarName}\\('(.+?)'\\)`;
  return curJs.join('\n').replace(new RegExp(tableRegex, 'g'), function(_, tableIndex) {
    return `'${strTable[tableIndex - 0]}'`;
  });
}

function formatJs(js) {
  const a = decodeEscapeSequance(js);
  const b = beautify(a, { indent_size: 2 });
  const c = unpackStringArr(b);
  const d = c.split('\n');

  // Debug
  d.forEach((line, i) => {
    console.log(`${i}\t${line}`);
  });

  return d.join('\n');
}

const openload = (url, cb) =>
  request(url, (err, response, body) => {
    let r = body.indexOf('streamurl') - 18
    let l = body.lastIndexOf('>', r) + 1
    let idl = body.lastIndexOf('=', l) + 2;
    let idr = body.lastIndexOf('"', l);

    const patch = `
      var g = '${body.substring(idl, idr)}';
      var document = {
        doctype: '',
        write: (v) => console.log(v),
        getElementById: "[native code",
        createElement: "[native code",
        ready: (f) => f(),
      };
      var navigator = {
        userAgent: '',
      };
      var window = {
        alert: "[native code",
      };

      var $ = (ident) => {
        if ( typeof ident !== 'string' ) {
          return ident;
        }

        // TODO: Continue debuging
        if ( ident === '#streamurl' ) {
          return ({
            text: streamurl => {
              if (streamurl) {
                flag = streamurl;
              } else {
                throw new Error('Shouldn\\\'t read in here');
              }
            }
          });
        } else if (ident === '#' + g) {
          return ({
            text: () => {
              return '${body.substring(l, r)}'
            },
          });
        } else {
          console.log('wtf - ', ident);
        }
      };
    `;

    r = body.lastIndexOf('</script>')
    r = body.lastIndexOf('\n', r)
    l = body.lastIndexOf('<script', r)
    l = body.indexOf('var', l)
    const sandbox = { console, Math };
    // let finalJs = patch + formatJs(body.substring(l, r));
    let finalJs = patch + body.substring(l, r);
    const vmScript = new vm.Script(finalJs);
    vmScript.runInNewContext(sandbox)
    cb(`https://openload.co/stream/${sandbox.flag}?mime=true`);
	});

openload('https://openload.co/embed/lwdT72TcZbY', (url) => console.log(url));
