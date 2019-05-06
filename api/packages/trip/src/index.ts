export const trip = {
  tripService: require('./service'),
  transports: {
    http: require('./transports/http'),
  },
  entities: {
    models: {
      Trip: require('./entities/models/trip'),
    },
    schemas: {
      TripSchema: require('./entities/schemas/trip'),
    },
  },
};
