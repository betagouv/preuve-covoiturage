import { Observable, Subject } from 'rxjs';
import { filter, finalize, map, takeUntil, tap } from 'rxjs/operators';
import { Type } from '@angular/core';

import { IModel } from '~/core/entities/IModel';
import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { IFormModel } from '~/core/entities/IFormModel';
import { IClone } from '~/core/entities/IClone';
import { IMapModel } from '~/core/entities/IMapModel';
import { GetListStore } from '~/core/services/store/getlist-store';

export type PatchParams<IPatchParamT> = {
  _id: number;
  patch: IPatchParamT;
};

export abstract class CrudStore<
  EntityT extends IModel & IFormModel<FormModelT> & IClone<EntityT> & IMapModel<EntityT>,
  EntityListT extends IModel = EntityT,
  IPatchT = any,
  JsonRpcCrudT extends JsonRpcCrud<EntityT, EntityListT, IPatchT> = JsonRpcCrud<EntityT, EntityListT, IPatchT>,
  FormModelT = any
> extends GetListStore<EntityT, EntityListT, JsonRpcCrudT> {
  // dismiss subject triggerd in order to cancel current rpc calls
  protected dismissDeleteSubject = new Subject();
  protected dismissUpdateCreateSubject = new Subject();

  constructor(protected rpcCrud: JsonRpcCrudT, protected modelType: Type<EntityT>) {
    super(rpcCrud);
  }

  select(entity: EntityListT) {
    this.selectById(entity._id);
  }

  // select Entity from List
  selectEntityByIdFromList(id: number): Observable<EntityT> {
    return this.entities$.pipe(
      filter((entities) => entities.length > 0),
      map((entities: EntityListT[]) => {
        const foundEntityListItem = entities.filter((entity) => entity._id === id)[0];
        if (foundEntityListItem) {
          const foundEntity = new this.modelType().map(foundEntityListItem);
          this.entitySubject.next(foundEntity);
          return foundEntity;
        }
        throw Error();
      }),
    );
  }

  selectNew(entity: EntityT = new this.modelType()) {
    const newEntity = entity.clone();
    delete newEntity._id;
    this.entitySubject.next(newEntity);
    return newEntity;
  }

  public getById(id: number) {
    this.dismissGetSubject.next();
    this._loadCount += 1;
    console.log('> getById ');
    return this.rpcCrud.getById(id).pipe(
      finalize(() => {
        if (this._loadCount > 0) this._loadCount -= 1;
        console.log('this._loadCount : ', this._loadCount);
      }),
      takeUntil(this.dismissGetSubject),
      map((entity) => new this.modelType().map(entity)),
      tap((entity) => {
        this.entitySubject.next(entity);
      }),
    );
  }

  protected selectById(id: number) {
    this.getById(id).subscribe();
  }

  deleteSelected(): Observable<boolean> {
    if (this.entitySubject.value && this.entitySubject.value._id) {
      return this.deleteById(this.entitySubject.value._id);
    }
  }

  delete(entity: EntityT): Observable<boolean> {
    return this.deleteById(entity._id);
  }

  protected deleteById(id: number): Observable<boolean> {
    this._loadCount += 1;
    return this.rpcCrud.delete(id).pipe(
      takeUntil(this.dismissDeleteSubject),
      finalize(() => {
        if (this._loadCount > 0) this._loadCount -= 1;
      }),
      tap((item) => {
        if (item.success) {
          this.loadList();
          this.entitySubject.next(null);
        }
      }),
      map(() => true),
    );
  }

  updateSelected(formValues: FormModelT): Observable<EntityT> {
    if (!this.entitySubject.value) throw new Error('try to update a non selected entity');
    const modEntity = this.entitySubject.value.clone();
    modEntity.updateFromFormValues(formValues);
    this._loadCount += 1;

    return this.rpcCrud.update(modEntity).pipe(
      takeUntil(this.dismissUpdateCreateSubject),
      finalize(() => {
        if (this._loadCount > 0) this._loadCount -= 1;
      }),
      map((entity) => new this.modelType().map(entity)),
      tap((territory) => {
        this.loadList();
      }),
    );
  }

  patchSelected(patchValues: IPatchT): Observable<EntityT> {
    if (!this.entitySubject.value) throw new Error('try to patch a non selected entity');

    return this.rpcCrud.patch(this.entitySubject.value._id, patchValues).pipe(
      takeUntil(this.dismissUpdateCreateSubject),
      finalize(() => {
        if (this._loadCount > 0) this._loadCount -= 1;
      }),
      map((entity) => new this.modelType().map(entity)),
      tap((model) => {
        this.entitySubject.next(model);
        this.loadList();
      }),
    );
  }

  create(formValues: FormModelT): Observable<EntityT> {
    const newEntity = this.entitySubject.value.clone();
    newEntity.updateFromFormValues(formValues);
    this._loadCount += 1;
    return this.rpcCrud.create(newEntity).pipe(
      takeUntil(this.dismissUpdateCreateSubject),
      finalize(() => {
        if (this._loadCount > 0) this._loadCount -= 1;
      }),
      tap((entity) => {
        this.entitySubject.next(new this.modelType().map(entity));
        this.loadList();
      }),
    );
  }

  dismissAllRpcActions() {
    super.dismissAllRpcActions();
    this.dismissUpdateCreateSubject.next();
    this.dismissDeleteSubject.next();
  }
}
