const CACHE_DURATION_HOURS = 1;

module.exports = (mongo, bus, processors) => async (key, args = {}) => {
  const { db } = mongo;

  if (!processors[key]) {
    throw new Error(`Undefined processor: ${key}`);
  }

  const { collection, commands } = processors[key](args);
  const cache = await db.collection('statistics').findOne({ key, coll: collection });

  const expiredAt = new Date(new Date().getTime() - CACHE_DURATION_HOURS * 3600);
  const expired = !cache || cache.updatedAt.getTime() - expiredAt < 0;

  if (expired) {
    bus.calculate({key, collection, commands});
  }

  return cache && cache.value ? JSON.parse(cache.value) : null;
};
