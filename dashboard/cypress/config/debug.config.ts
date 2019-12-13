/**
 * local debug tests
 */
import { TestsInterface } from './tests.interface';

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
      users: false,
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
      newcampaign: false,
      editcampaign: false,
      launchcampaign: false,
      newFromTemplate: false,
      exportTrips: false,
    },
  },
};
