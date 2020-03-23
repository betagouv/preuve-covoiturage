/**
 * continuous integration tests
 */
export const CI_CONFIG = {
  integration: {
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
      newcampaign: false,
      editcampaign: false,
      launchcampaign: false,
      newFromTemplate: false,
      exportTrips: false,
    },
  },
  e2e: {
    // no tests
  },
};
