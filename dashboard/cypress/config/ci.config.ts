/**
 * continuous integration tests
 */
export const CI_CONFIG = {
  integration: {
    operator: {
      profile: false,
      operator: false,
      applications: false,
      filters: false,
      visibility: false,
    },
    registry: {
      profile: false,
      filters: false,
      users: true,
      campaigns: false,
    },
    territory: {
      profile: false,
      territory: false,
      filters: false,
      newcampaign: false,
      editcampaign: false,
      launchcampaign: false,
      newFromTemplate: false,
      exportTrips: false,
    },
  },
  // e2e: {
  //   // no tests
  // },
};
