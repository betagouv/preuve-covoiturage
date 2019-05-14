export const policy = {
  kernel: require('./kernel/kernel'),
  incentiveCampaignService: require('./campaign'),
  incentiveParameterService: require('./parameter'),
  incentivePolicyService: require('./policy'),
  incentiveUnitService: require('./unit'),
  transports: {
    campaignHttp: require('./transports/campaignHttp'),
    parameterHttp: require('./transports/parameterHttp'),
    policyHttp: require('./transports/policyHttp'),
    unitHttp: require('./transports/unitHttp'),
  },
  entities: {
    models: {
      IncentiveCampaign: require('./entities/models/campaign'),
      IncentiveParameter: require('./entities/models/parameter'),
      IncentivePolicy: require('./entities/models/policy'),
      IncentiveUnit: require('./entities/models/unit'),
    },
    schemas: {
      IncentiveCampaignSchema: require('./entities/schemas/campaign'),
      IncentiveParameterSchema: require('./entities/schemas/parameter'),
      IncentivePolicySchema: require('./entities/schemas/policy'),
      IncentiveUnitSchema: require('./entities/schemas/unit'),
    },
    seeds: {
      incentiveParameters: require('./entities/seeds/incentive-parameters'),
      incentiveUnits: require('./entities/seeds/incentive-units'),
    },
  },
};
