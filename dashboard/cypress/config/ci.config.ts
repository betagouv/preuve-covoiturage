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
      newcampaign: true,
      editcampaign: false,
      launchcampaign: true,
      newFromTemplate: true,
      exportTrips: true,
    },
  },
  e2e: {
    // no tests
  },
};
