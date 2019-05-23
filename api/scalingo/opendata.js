/* eslint-disable */
const fs = require('fs');
const csv = require('csv');

const [,, ...args] = process.argv;

const readStream = fs.createReadStream(args[0]);
const writeStream = fs.createWriteStream(`${args[0]}`.replace('.csv', '-opendata.csv'));
const csvStream = csv.parse();

csvStream.on('data', (data) => {
  // rename ObjectId
  if (data[0] !== '_id') {
    [0, 3].forEach((i) => {
      data[i] = data[i].substring(9, data[i].length - 1);
    });

    // truncate lon/lat
    [14, 15, 20, 21, 33, 34, 39, 40].forEach((i) => {
      data[i] = (parseFloat(data[i]) * 1000 | 0) / 1000;
    });
  }

  const line = JSON.stringify(data);
  writeStream.write(`${line.substring(1, line.length - 1)}\n`);
});
csvStream.on('error', console.log);
csvStream.on('end', () => {
  console.log('done!');
});

readStream.pipe(csvStream);
