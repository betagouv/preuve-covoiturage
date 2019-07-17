import { Injectable } from '@angular/core';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';

import { ProfileInterface } from '../../profile/interfaces/profileInterface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private jsonRPC: JsonRPCService) {}

  patch(profile: ProfileInterface): void {
    const jsonRPCParam = new JsonRPCParam('user.patch', profile);

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
