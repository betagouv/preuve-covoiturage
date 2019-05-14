export const user = {
  userService: require('./service'),
  transports: {
    userHttp: require('./transports/userHttp'),
    profileHttp: require('./transports/profileHttp'),
  },
  entities: {
    models: {
      User: require('./entities/models/user'),
    },
    schemas: {
      UserSchema: require('./entities/schemas/user'),
    },
    seeds: {
      superAdmin: require('./entities/seeds/super-admin'),
    },
  },
  helpers: require('./helpers'),
};
