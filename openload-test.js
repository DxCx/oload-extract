const request = require('request');
const openloadExtract = require('./openload-extract').openloadExtract;

const openload = (id, cb) => {
  request('https://openload.co/embed/' + id, (err, response, text) => cb(openloadExtract(text)));
};

openload('4xOX4CdMrJk', (url) => console.log(url));
openload('537K_brBVGQ', (url) => console.log(url));
