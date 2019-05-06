export const stats = {
  statService: require('./service'),
  transports: {
    http: require('./transports/http'),
  },
  entities: {
    models: {
      Stat: require('./entities/models/stat'),
    },
    schemas: {
      StatSchema: require('./entities/schemas/stat'),
    },
  },
};
