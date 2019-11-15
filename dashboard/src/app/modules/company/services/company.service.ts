import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { ApiService } from '~/core/services/api/api.service';
import { Territory } from '~/core/entities/territory/territory';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CompanyService extends ApiService<Territory> {
  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _authService: AuthenticationService,
  ) {
    super(_http, _jsonRPC, 'company');
  }

  findCompany(siret: string, source?: string) {
    console.log('siret : ', siret);
    return this._jsonRPC.callOne(new JsonRPCParam(this._method + ':find', { siret, source })).pipe(
      map((company) => {
        const siren = parseInt(siret.substr(0, 9), 10);
        // tslint:disable-next-line:variable-name
        const intra_vat = `FR${(12 + 3 * (siren % 97)) % 97}${siren}`;
        return {
          ...company.data,
          intra_vat,
        };
      }),
    );
  }
}
