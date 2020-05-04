import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';
import { CompanyV2 } from '~/core/entities/shared/companyV2';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';

@Injectable({
  providedIn: 'root',
})
export class CompanyService extends JsonRpcGetList<CompanyV2> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'company');
  }

  fetchCompany(siret: string): Observable<CompanyV2> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:fetch`, siret);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  // findCompany(siret:string): Observable<CompanyV2> {
  //   return this.get(params).pipe(
  //     map((company) => {
  //       // TODO : apply company migration
  //       return null;
  //       /*
  //       const siren = parseInt(params.siret.substr(0, 9), 10);
  //       let tvaPrefix = ((12 + 3 * (siren % 97)) % 97).toString();
  //       for (let i = 0; i < 2 - tvaPrefix.length; i += 1) {
  //         tvaPrefix = `0${tvaPrefix}`;
  //       }
  //       // tslint:disable-next-line:variable-name
  //       const intra_vat = `FR${tvaPrefix}${siren}`;
  //       return new CompanyV2({
  //         ...company,
  //         intra_vat,
  //       });
  //       */
  //     }),
  //   );
  // }
}
