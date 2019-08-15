import { Injectable } from '@angular/core';

import { ApiService } from '~/shared/services/apiService';

@Injectable()
export class IncentiveCampaignService extends ApiService {
  public endPoint = '/incentive/campaigns';

  public messages = {
    created: "La campagne d'incitation a bien été lancée.",
    deleted: "La campagne d'incitation a bien été supprimée.",
    updated: "La campagne d'incitation a bien été mise à jour",
  };
}
