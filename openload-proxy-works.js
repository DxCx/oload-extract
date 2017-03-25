const request = require('request');
const vm = require('vm');

const openload = (url, cb) =>
  request(url, (err, response, body) => {
    let r = body.indexOf('streamurl') - 18
    let l = body.lastIndexOf('>', r) + 1
    const patch = `
      r = 0
      $ = () => ({
        text: streamurl => {
          if (streamurl)
            flag = streamurl
          else
            return '${body.substring(l, r)}'
        }
      })
    `
    r = body.lastIndexOf('</script>')
    r = body.lastIndexOf('\n', r) - 3
    l = body.lastIndexOf('<script', r)
    l = body.indexOf('var', l)
    const sandbox = {}
    new vm.Script(patch + body.substring(l, r)).runInNewContext(sandbox)
    cb(`https://openload.co/stream/${sandbox.flag}?mime=true`);
	});

openload('https://openload.co/embed/4xOX4CdMrJk', (url) => console.log(url));
