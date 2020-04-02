/**
 * local debug tests
 */
import { TestsInterface } from './tests.interface';

/**
 * Don't not commit changes to this file, to avoid conflicts
 */
export const DEBUG_CONFIG = {
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
      users: false,
      campaigns: false,
    },
    territory: {
      profile: false,
      territory: false,
      filters: false,
      newcampaign: true,
      editcampaign: false,
      launchcampaign: false,
      newFromTemplate: false,
      exportTrips: false,
    },
  } as TestsInterface,
  e2e: {
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
      users: false,
      campaigns: false,
    },
    territory: {
      profile: true,
      territory: true,
      filters: false,
      newcampaign: false,
      editcampaign: false,
      launchcampaign: false,
      newFromTemplate: false,
      exportTrips: false,
    },
  } as TestsInterface,
};
