/**
 * local debug tests
 */
import { TestsInterface } from './tests.interface';

/**
 * Don't not commit changes to this file, to avoid conflicts
 */
export const DEBUG_CONFIG = {
  integration: <TestsInterface>{
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
  e2e: <TestsInterface>{
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
<<<<<<< HEAD
      filters: false,
=======
      filters: true,
>>>>>>> (dash) fix: user tests, update e2e local tests
      newcampaign: false,
      editcampaign: false,
      launchcampaign: false,
      newFromTemplate: false,
      exportTrips: false,
    },
  },
};
