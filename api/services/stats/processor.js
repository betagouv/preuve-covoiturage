module.exports = db => async (job) => {
  const { key, collection, commands } = job.data;

  const cache = await commands.reduce(
    (acc, { command, args }) => acc[command](args),
    db.collection(collection),
  );

  const value = JSON.stringify(cache);

  await db
    .collection('statistics')
    .updateOne(
      { key, coll: collection },
      { $set: { key, value, coll: collection, updatedAt: new Date() } },
      { upsert: 1 },
    );
};
