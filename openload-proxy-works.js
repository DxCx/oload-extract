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

function expandOneLiners(js) {
  // First, get the table and strip it out of the JS.
  let varName = '';
  let funcMapString = '';
  const strippedJs = js.replace(/var\s(.+?)\s=\s\{([\S\s.]+?)\};/m, function(fullMatch, vn, fms) {
    varName = vn;
    funcMapString = fms;
    return '';
  });

  // Parse the table into funcMap
  const funcMapRegex = new RegExp(/'(.+?)':\sfunction\s.+?\((.+?)\)\s\{[\S\s]+?return\s(.+?);/, 'gm');
  const funcMap = {};
  let matchObj;
  while ( matchObj = funcMapRegex.exec(funcMapString) ) {
    funcMap[matchObj[1]] = {
      args: matchObj[2].split(",").map((v) => v.trim()),
      template: matchObj[3],
    };
  }

  const expanedRegex = new RegExp(`${varName}\\['(\\w+?)'\\]\\(([^\(\)]+?)\\)`);
  const finalExpanedRegex = new RegExp(`${varName}\\['(\\w+?)'\\]\\((.+)\\)`);
  const replaceFuncGen = (regexSplit) => function (full, templateName, templateArgsString) {
    if ( ! funcMap.hasOwnProperty(templateName) ) {
      throw new Error(`Invalid template name found ${templateName}`);
    }
    const templateArgs = regexSplit ?
      templateArgsString.match(/(\(.*?\)|[^\(\),\s])+(?=.*,|.*$)/g) :
      templateArgsString.split(",").map((v) => v.trim());

    if ( templateArgs.length !== funcMap[templateName].args.length ) {
      throw new Error(`Arguments ${templateArgs} doesn't match template ${templateName}`);
    }
    let line = funcMap[templateName].template;
    funcMap[templateName].args.forEach((argName, argId) => {
      line = line.replace(argName, templateArgs[argId]);
    });
    return line;
  };

  let expandedJs = strippedJs;
  // First of all, Expanding all "Simple" calls
  while ( expandedJs.match(expanedRegex) ) {
    expandedJs = expandedJs.replace(expanedRegex, replaceFuncGen(false));
  }
  // Next expand the more generic regex ones.
  while ( expandedJs.match(finalExpanedRegex) ) {
    expandedJs = expandedJs.replace(finalExpanedRegex, replaceFuncGen(true));
  }

  return expandedJs;
}

function replaceKeyAccess(js) {
  return js.replace(/(.+?)\['(\w+)'\]/g, function(f, varName, keyName) {
    return `${varName}.${keyName}`;
  });
}

function formatJs(js) {
  const a = decodeEscapeSequance(js);
  const b = beautify(a, { indent_size: 2 });
  const c = unpackStringArr(b);
  const d = expandOneLiners(c);
  const e = replaceKeyAccess(d);
  const result = e;

  const final = beautify(result, { indent_size: 2 }).split('\n');
  // Debug
  final.forEach((line, i) => {
    console.log(`${i}\t${line}`);
    //console.log(line);
  });
  return final.join('\n');
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
        getElementsByTagName: "[native code",
        createElement: "[native code",
        ready: (f) => f(),
      };
      var navigator = {
        userAgent: '',
      };
      var window = {
        alert: "[native code",
      };

      var jQuery = (ident) => {
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
    var $ = jQuery;
    `;

    r = body.lastIndexOf('</script>')
    r = body.lastIndexOf('\n', r)
    l = body.lastIndexOf('<script', r)
    l = body.indexOf('var', l)
    const sandbox = { console, Math };
    //let finalJs = patch + formatJs(body.substring(l, r));
    let finalJs = patch + body.substring(l, r);
    const vmScript = new vm.Script(finalJs);
    vmScript.runInNewContext(sandbox)
    cb(`https://openload.co/stream/${sandbox.flag}?mime=true`);
	});

openload('https://openload.co/embed/lwdT72TcZbY', (url) => console.log(url));
