import { Injectable } from '@angular/core';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';

@Injectable({
  providedIn: 'root',
})
export class TerritoryService {
  constructor(private jsonRPC: JsonRPCService) {}

  public patch(territory) {
    const jsonRPCParam = new JsonRPCParam('territory.patch', territory);

    this.jsonRPC.call(jsonRPCParam).subscribe(
      (data) => {
        console.log('success', data);
      },
      (err) => {
        console.log('error', err);
      },
    );
  }
}
