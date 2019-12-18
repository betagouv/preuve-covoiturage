import { TestsInterface } from './tests.interface';

/**
 * continuous integration tests
 */
export const CI_CONFIG = {
  integration: <TestsInterface>{
    operator: {
      profile: true,
      operator: true,
      applications: true,
      filters: true,
      visibility: true,
    },
    registry: {
      profile: true,
      filters: true,
      users: true,
      campaigns: true,
    },
    territory: {
      profile: true,
      territory: true,
      filters: true,
      newcampaign: true,
      editcampaign: true,
      launchcampaign: false,
      newFromTemplate: false,
      exportTrips: false,
    },
  },
  e2e: <TestsInterface>{
    // no tests
  },
};
