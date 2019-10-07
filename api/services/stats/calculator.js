const CACHE_DURATION_HOURS = process.env.STAT_CACHE_DURATION_HOURS || 24;

// generate a uniq key based on the args signature
const fullKeyGenerator = (key, args = {}, id = null) =>
  [
    key,
    ...Object.keys(args).map((k) => {
      switch ((typeof args[k]).toLowerCase()) {
        case 'number':
        case 'string':
          return `${k}-${args[k]}`.replace(/[^a-z0-9-_]/gi, '');
        default:
          if (!id === null) {
            throw new Error(
              'You must pass a unique ID to be used as cache key when calculator arguments contain an object',
            );
          }
          return `${k}-${id}`.replace(/[^a-z0-9-_]/gi, '');
      }
    }),
  ]
    .join('-')
    .substring(0, 128);

module.exports = (mongo, bus, processors) => async (key, args = {}, id = null) => {
  const { db } = mongo;
  const fullKey = fullKeyGenerator(key, args, id);

  if (!processors[key]) {
    throw new Error(`Undefined processor: ${key}`);
  }

  const { collection, commands } = processors[key](args);
  const cache = await db.collection('statistics').findOne({ key: fullKey, coll: collection });

  const expiredAt = new Date(new Date().getTime() - CACHE_DURATION_HOURS * 3600000 * 0.9);
  const expired = !cache || cache.updatedAt.getTime() - expiredAt < 0;

  if (expired) {
    bus.calculate({ key: fullKey, collection, commands });
  }

  return cache && cache.value ? JSON.parse(cache.value) : null;
};
