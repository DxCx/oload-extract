const request = require('request');
const astify = require('astify');
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

function UnflatterRecursive(block) {
  if ( !block.body ) {
    return block;
  }

  // Hunting the initial var = ... while ...
  if ( block.body &&
       block.body[0] &&
       'VariableDeclaration' === block.body[0].type &&
       block.body[1] &&
       'WhileStatement' === block.body[1].type) {
    return UnflatterASTBegin(block);
  }

  // Getting deeper
  block.body = UnflatterRecursive(block.body);
  return block;
}

function UnflatterASTWhile(executeOrder, block) {
  if ( block.type !== 'WhileStatement' ) {
    return block;
  }

  if ( ! block.body.body[0] ||
       'SwitchStatement' !== block.body.body[0].type ||
       ! block.body.body[1] ||
       'BreakStatement' !== block.body.body[1].type) {
    return block;
  }

  const switchCasesAST = block.body.body[0].cases;
  const orderedBlocks = executeOrder.reduce((curArr, blockId) => {
    switchCasesAST[blockId].consequent.forEach((codeBlock) => {
      if ( codeBlock.type === 'ContinueStatement' ) {
        return;
      }

      curArr.push(UnflatterRecursive(codeBlock));
    });

    return curArr;
  }, []);

  return new astify.ASTNode.types.BlockStatement(orderedBlocks);
}

// First part of pattern, var XX = "".split("|"); while
function UnflatterASTBegin(block) {
  if ( !block.type ) {
    return block;
  }

  // Hunting the initial var = ... while ...
  if ( ! block.body ||
       ! block.body[0] ||
       'VariableDeclaration' !== block.body[0].type ||
       ! block.body[1] ||
       'WhileStatement' !== block.body[1].type) {
    return block;
  }

  if ( ! block.body[0].declarations[0] ||
       ! block.body[0].declarations[0].init ||
       ! block.body[0].declarations[0].init.callee ||
       ! block.body[0].declarations[0].init.callee.property ||
       'split' !== block.body[0].declarations[0].init.callee.property.name ||
       ! block.body[0].declarations[0].init.callee.object ||
       undefined === block.body[0].declarations[0].init.callee.object.value) {
    return block;
  }

  if ( ! block.body[0].declarations[1] ||
       ! block.body[0].declarations[1].init ||
       undefined === block.body[0].declarations[1].init.value ) {
    return block;
  }

  // extract the execute order out of the string.
  const executeOrder = block.body[0].declarations[0].init.callee.object.value.split("|");
  return UnflatterASTWhile(executeOrder, block.body[1]);
}

function unflatter(js) {
  // convert to AST
  const ast = new astify.AST(4, undefined, js);
  // extract only the main function
  const func = ast.ast.body[0].expression.arguments[0].body;

  // Unflatter the AST (Recursive)
  return UnflatterASTBegin(func).toSource();
}

function formatJs(js) {
  const a = decodeEscapeSequance(js);
  const b = beautify(a, { indent_size: 2 });
  const c = unpackStringArr(b);
  const d = expandOneLiners(c);
  const e = replaceKeyAccess(d);
  const f = unflatter(e);
  const result = f;

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
    //let idl = body.lastIndexOf('=', l) + 2;
    //let idr = body.lastIndexOf('"', l);
    //var g = '${body.substring(idl, idr)}';

    const patch = `
      var g = 0;
      var document = {
        write: (v) => console.log(v),
        getElementById: "[native code",
        createTextNode: "[native code",
        ready: (f) => f(),
      };
      var window = {};

      var $ = (ident) => {
        if ( typeof ident !== 'string' ) {
          return ident;
        }

        return ({
          text: streamurl => {
            if (streamurl) {
              flag = streamurl;
            } else {
              return '${body.substring(l, r)}'
            }
          }
        });
      }

      var jQuery = {
        post: '',
      }
    `;

    r = body.lastIndexOf('</script>')
    r = body.lastIndexOf('\n', r)
    l = body.lastIndexOf('<script', r)
    l = body.indexOf('var', l)
    const sandbox = { console, Math };
    //const cleanRunJs = formatJs(body.substring(l, r));
    const cleanRunJs = body.substring(l, r);
    //require('fs').writeFileSync('openload-extracted.js', cleanRunJs);
    let finalJs = patch + cleanRunJs;
    const vmScript = new vm.Script(finalJs);
    vmScript.runInNewContext(sandbox)
    cb(`https://openload.co/stream/${sandbox.flag}?mime=true`);
	});

openload('https://openload.co/embed/lwdT72TcZbY', (url) => console.log(url));
