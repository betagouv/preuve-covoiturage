/* eslint-disable */

const { MongoClient } = require('mongodb');
const assert = require('assert');
const axios = require('axios');

// Connection URL
const url = process.env.MONGO_URL || 'mongodb://mongo:mongo@localhost:27017';

// Database Name
const dbName = 'pdc-local';

// Create a new MongoClient
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

const upd = async (col, doc) => {
  try {
    let url;
    let res;
    let data;

    const api = 'http://osrm.covoiturage.beta.gouv.fr:5000/route/v1/driving/';
    const update = {};

    // passenger
    url = `${api}${doc.passenger.start.lon},${doc.passenger.start.lat};${doc.passenger.end.lon},${doc.passenger.end.lat}`;
    res = await axios.get(url);
    data = res.data;
    if (data && data.routes && data.routes[0]) {
      update['passenger.calc_distance'] = data.routes[0].distance || null;
      update['passenger.calc_duration'] = data.routes[0].duration || null;
    }

    // driver
    url = `${api}${doc.driver.start.lon},${doc.driver.start.lat};${doc.driver.end.lon},${doc.driver.end.lat}`;
    res = await axios.get(url);
    data = res.data;
    if (data && data.routes && data.routes[0]) {
      update['driver.calc_distance'] = data.routes[0].distance || null;
      update['driver.calc_duration'] = data.routes[0].duration || null;
    }

    // update
    if (update !== {}) {
      console.log(
        'update',
        doc._id.toString(),
        update['passenger.calc_distance'],
        update['passenger.calc_duration'],
        update['driver.calc_distance'],
        update['driver.calc_duration'],
      );

      return col.updateOne({ _id: doc._id }, { $set: update });
    }
  } catch (e) {
    console.log(e.message);
  }

  return doc;
};

// Use connect method to connect to the Server
client.connect(async (err) => {
  assert.equal(null, err);
  console.log('Connected successfully to server');

  const db = client.db(dbName);
  const col = db.collection('journeys');
  const promises = [];

  const docs = await col
    .find({ 'passenger.calc_distance': { $exists: false } })
    .project({
      'passenger.start.datetime': 1,
      'passenger.start.lon': 1,
      'passenger.start.lat': 1,
      'passenger.end.lon': 1,
      'passenger.end.lat': 1,
      'driver.start.lon': 1,
      'driver.start.lat': 1,
      'driver.end.lon': 1,
      'driver.end.lat': 1,
    })
    .sort({ 'passenger.start.datetime': -1 })
    .limit(process.env.MONGO_LIMIT ? parseInt(process.env.MONGO_LIMIT, 10) : 1)
    .toArray();

  docs.forEach((doc) => {
    promises.push(upd(col, doc));
  });

  await Promise.all(promises);

  client.close();
});
