import { Injectable } from '@angular/core';

import { ApiService } from '~/shared/services/apiService';

@Injectable()
export class IncentivePolicyService extends ApiService {
  public endPoint = '/incentive/policies';

  public messages = {
    created: "La politique d'incitation a bien été crée.",
    deleted: "La politique d'incitation a bien été supprimé.",
    updated: "La politique d'incitation a bien été mise à jour",
  };
}
