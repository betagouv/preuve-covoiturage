require('reflect-metadata');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');
const express = require('express');

const allowedExt = [
  '.js',
  '.ico',
  '.css',
  '.png',
  '.jpg',
  '.woff2',
  '.woff',
  '.ttf',
  '.svg',
];

const app = express();

app.get('*', (req, res) => {
  if (allowedExt.filter(ext => req.url.indexOf(ext) > 0).length > 0) {
    res.sendFile(path.resolve(`dist/dashboard/${req.url}`));
  } else {
    res.sendFile(path.resolve('dist/dashboard/index.html'));
  }
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.raw({limit: '50mb'}));
app.use(bodyParser.text({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.listen(process.env.PORT || 9090, () => console.log('http is started'));
app.on('error', (error) => {
  console.error(moment().format(), 'ERROR', error);
});
process.on('uncaughtException', (error) => {
  console.log(moment().format(), error);
});
