import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { CrudStore } from '~/core/services/store/crud-store';
import { Contacts, Operator } from '~/core/entities/operator/operator';

import { OperatorApiService } from './operator-api.service';

@Injectable({
  providedIn: 'root',
})
export class OperatorStoreService extends CrudStore<Operator, Operator, any, OperatorApiService> {
  constructor(protected operatorApi: OperatorApiService) {
    super(operatorApi, Operator);
  }

  patchContact(contactFormData: any, id: number): Observable<Operator> {
    return this.rpcCrud.patchContact({ patch: new Contacts(contactFormData), _id: id }).pipe(
      tap((operator) => {
        this.entitySubject.next(operator);
        this.loadList();
      }),
    );
  }
}
