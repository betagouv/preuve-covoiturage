import { CrudStore } from '~/core/services/store/crud-store';
import { Contacts, Operator } from '~/core/entities/operator/operator';
import { Injectable } from '@angular/core';
import { OperatorApiService } from './operator-api.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OperatorStoreService extends CrudStore<Operator, Operator, OperatorApiService> {
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
