import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Operator } from '~/core/entities/operator/operator';
import { CrudStore } from '~/core/services/store/crud-store';
import { ContactsMapper } from '../../../core/entities/shared/contacts';
import { OperatorApiService } from './operator-api.service';

@Injectable({
  providedIn: 'root',
})
export class OperatorStoreService extends CrudStore<Operator, Operator, any, OperatorApiService> {
  constructor(protected operatorApi: OperatorApiService) {
    super(operatorApi, Operator);
  }

  patchContact(contactFormData: any, id: number): Observable<Operator> {
    const contact = ContactsMapper.toModel(contactFormData);
    return this.rpcCrud.patchContact({ patch: contact, _id: id }).pipe(
      tap((operator) => {
        this.entitySubject.next(operator);
        this.loadList();
      }),
    );
  }
}
