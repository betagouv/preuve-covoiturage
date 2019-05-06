import aomService = require('./aomService');
import operatorService = require('./operatorService');
import applicationService = require('./applicationService');

export const organization = {
  aomService,
  applicationService,
  operatorService,
  transports: {
    aomHttp: require('./transports/aomHttp'),
    operatorHttp: require('./transports/operatorHttp'),
    applicationHttp: require('./transports/applicationHttp'),
  },
  entities: {
    models: {
      Aom: require('./entities/models/Aom'),
      Operator: require('./entities/models/Operator'),
      Token: require('./entities/models/Token'),
    },
    schemas: {
      AomSchema: require('./entities/schemas/aom'),
      OperatorSchema: require('./entities/schemas/operator'),
      ApplicationSchema: require('./entities/schemas/application'),
      TokenSchema: require('./entities/schemas/token'),
    },
    seeds: {
      aom: require('./entities/seeds/aom'),
      dummyAom: require('./entities/seeds/dummy-aom'),
      dummyOperator: require('./entities/seeds/dummy-operator'),
    }
  },
};
