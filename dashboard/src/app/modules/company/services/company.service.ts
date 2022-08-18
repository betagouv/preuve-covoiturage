import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';
import { ResultInterface as CompanyInterface } from '~/shared/company/find.contract';

@Injectable({
  providedIn: 'root',
})
export class CompanyService extends JsonRpcGetList<CompanyInterface> {
  constructor(http: HttpClient) {
    super(http, 'company');
  }

  fetchCompany(siret: string): Observable<CompanyInterface> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:fetch`, siret);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  getById(id: number): Observable<CompanyInterface> {
    return this.get({ query: { _id: id } } as any);
  }
}
