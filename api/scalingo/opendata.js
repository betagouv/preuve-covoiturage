/* eslint-disable */
const fs = require('fs');
const csv = require('csv');

const [, , ...args] = process.argv;

const readStream = fs.createReadStream(args[0]);
const writeStream = fs.createWriteStream(`${args[0]}`.replace('.csv', '-opendata.csv'));
const csvStream = csv.parse();

csvStream.on('data', data => {
  if (data[0] !== '_id') {
    // rename ObjectId
    [0].forEach(i => {
      data[i] = data[i].substring(9, data[i].length - 1);
    });

    // truncate lon/lat
    [12, 13, 18, 19, 31, 32, 37, 38].forEach(i => {
      data[i] = ((parseFloat(data[i]) * 1000) | 0) / 1000;
    });
  }

  const line = JSON.stringify(data);
  writeStream.write(`${line.substring(1, line.length - 1)}\n`);
});
csvStream.on('error', console.log);
csvStream.on('end', () => {
  console.log('Open data cleaning done');
});

readStream.pipe(csvStream);
