/**
 * continuous integration tests
 */

export const CI_WAIT = {
  waitShort: Cypress.env('WAIT_SHORT') || 300,
  waitLong: Cypress.env('WAIT_LONG') || 3000,
};
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
      editcampaign: true,
      launchcampaign: true,
      newFromTemplate: true,
      exportTrips: true,
    },
  },
  // e2e: {
  //   // no tests
  // },
};
