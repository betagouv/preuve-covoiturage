const { MongoClient } = require('mongodb');

(async () => {
  const client = await MongoClient.connect(process.env.APP_MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).catch(console.log);
  const db = process.env.APP_MONGO_DB;
  const journeys = client.db(db).collection('journeys');
  const prepared = client.db(db).collection('prepared');
  const cache = client.db(db).collection('statistics');

  try {
    // find most recent record from prepared
    const latest = ((await prepared.find({}, { sort: { datetime: -1 }, limit: 1 }).toArray()) || []).pop();
    const matchQuery = latest && 'datetime' in latest ? { $gt: latest.datetime, $lt: new Date() } : { $lt: new Date() };

    // update prepared with missing journeys
    const cursor = journeys.aggregate(
      [
        {
          $match: { 'passenger.start.datetime': matchQuery },
        },
        {
          $sort: { 'passenger.start.datetime': 1 },
        },
        {
          $project: {
            datetime: '$passenger.start.datetime',
            year: { $year: '$passenger.start.datetime' },
            month: { $month: '$passenger.start.datetime' },
            weekday: { $isoDayOfWeek: '$passenger.start.datetime' },
            duration: { $max: ['$passenger.duration', '$passenger.calc_duration'] },
            distance: { $max: ['$passenger.distance', '$passenger.calc_distance'] },
          },
        },
      ],
      { allowDiskUse: true },
    );

    console.log('Insert missing journeys (can take a while, grab a ☕)');
    let st = new Date();
    let count = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      await prepared.insertOne(doc);
      count++;
    }
    console.log(`> Inserted ${count} results in ${(new Date().getTime() - st.getTime()) / 1000}s`);

    console.log('\nCalculate all statistics');

    // journeysAllTimes
    st = new Date();
    let result = await prepared.find({}).count();
    if (result) {
      await cache.updateOne(
        { key: 'journeysAllTimes' },
        {
          $set: {
            coll: 'journeys',
            key: 'journeysAllTimes',
            updatedAt: new Date(),
            value: result,
          },
        },
        { upsert: true },
      );
      console.log(`> journeysAllTimes\tupdated in ${(new Date().getTime() - st.getTime()) / 1000}s`);
    }

    // journeysPerMonth
    st = new Date();
    result = await prepared
      .aggregate([
        { $group: { _id: { y: '$year', m: '$month' }, total: { $sum: 1 } } },
        { $sort: { '_id.y': 1, '_id.m': 1 } },
      ])
      .toArray();
    if (result) {
      await cache.updateOne(
        { key: 'journeysPerMonth' },
        {
          $set: {
            coll: 'journeys',
            key: 'journeysPerMonth',
            updatedAt: new Date(),
            value: JSON.stringify(result),
          },
        },
        { upsert: true },
      );
      console.log(`> journeysPerMonth\tupdated in ${(new Date().getTime() - st.getTime()) / 1000}s`);
    }

    // journeysPerDay
    st = new Date();
    result = await prepared
      .aggregate([
        { $group: { _id: { y: '$year', m: '$month', d: '$weekday' }, total: { $sum: 1 } } },
        { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
      ])
      .toArray();
    if (result) {
      await cache.updateOne(
        { key: 'journeysPerDay' },
        {
          $set: {
            coll: 'journeys',
            key: 'journeysPerDay',
            updatedAt: new Date(),
            value: JSON.stringify(result),
          },
        },
        { upsert: true },
      );
      console.log(`> journeysPerDay\tupdated in ${(new Date().getTime() - st.getTime()) / 1000}s`);
    }

    // distanceAllTimes
    st = new Date();
    result = await prepared
      .aggregate([{ $group: { _id: { name: 'distance' }, total: { $sum: '$distance' } } }])
      .toArray();
    if (result) {
      await cache.updateOne(
        { key: 'distanceAllTimes' },
        {
          $set: {
            coll: 'journeys',
            key: 'distanceAllTimes',
            updatedAt: new Date(),
            value: JSON.stringify(result),
          },
        },
        { upsert: true },
      );
      console.log(`> distanceAllTimes\tupdated in ${(new Date().getTime() - st.getTime()) / 1000}s`);
    }

    // distancePerMonth
    st = new Date();
    result = await prepared
      .aggregate([
        { $group: { _id: { y: '$year', m: '$month' }, total: { $sum: '$distance' } } },
        { $sort: { '_id.y': 1, '_id.m': 1 } },
      ])
      .toArray();
    if (result) {
      await cache.updateOne(
        { key: 'distancePerMonth' },
        {
          $set: {
            coll: 'journeys',
            key: 'distancePerMonth',
            updatedAt: new Date(),
            value: JSON.stringify(result),
          },
        },
        { upsert: true },
      );
      console.log(`> distancePerMonth\tupdated in ${(new Date().getTime() - st.getTime()) / 1000}s`);
    }

    // distancePerDay
    st = new Date();
    result = await prepared
      .aggregate([
        { $group: { _id: { y: '$year', m: '$month', d: '$weekday' }, total: { $sum: '$distance' } } },
        { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
      ])
      .toArray();
    if (result) {
      await cache.updateOne(
        { key: 'distancePerDay' },
        {
          $set: {
            coll: 'journeys',
            key: 'distancePerDay',
            updatedAt: new Date(),
            value: JSON.stringify(result),
          },
        },
        { upsert: true },
      );
      console.log(`> distancePerDay\tupdated in ${(new Date().getTime() - st.getTime()) / 1000}s`);
    }

    // durationAllTimes
    st = new Date();
    result = await prepared
      .aggregate([{ $group: { _id: { name: 'duration' }, total: { $sum: '$duration' } } }])
      .toArray();
    if (result) {
      await cache.updateOne(
        { key: 'durationAllTimes' },
        {
          $set: {
            coll: 'journeys',
            key: 'durationAllTimes',
            updatedAt: new Date(),
            value: JSON.stringify(result),
          },
        },
        { upsert: true },
      );
      console.log(`> durationAllTimes\tupdated in ${(new Date().getTime() - st.getTime()) / 1000}s`);
    }
  } catch (e) {
    console.log(e.message);
  }

  await client.close();
})();
