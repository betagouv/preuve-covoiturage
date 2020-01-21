export interface TestsInterface {
  operator: {
    profile: boolean;
    operator: boolean;
    applications: boolean;
    filters: boolean;
    visibility: boolean;
  };
  registry: {
    profile: boolean;
    filters: boolean;
    users: boolean;
    campaigns: boolean;
  };
  territory: {
    profile: boolean;
    territory: boolean;
    filters: boolean;
    newcampaign: boolean;
    editcampaign: boolean;
    launchcampaign: boolean;
    newFromTemplate: boolean;
    exportTrips: boolean;
  };
}
