import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { finalize, map, takeUntil, tap } from 'rxjs/operators';
import { Type } from '@angular/core';

import { IModel } from '~/core/entities/IModel';
import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { IFormModel } from '~/core/entities/IFormModel';
import { IClone } from '~/core/entities/IClone';
import { IMapModel } from '~/core/entities/IMapModel';

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
> {
  protected entitiesSubject = new BehaviorSubject<EntityListT[]>([]);
  protected entitySubject = new BehaviorSubject<EntityT>(null);

  // dismiss subject triggerd in order to cancel current rpc calls
  protected dismissGetSubject = new Subject();
  protected dismissDeleteSubject = new Subject();
  protected dismissGetListSubject = new Subject();
  protected dismissUpdateCreateSubject = new Subject();

  // content
  protected _entities$ = this.entitiesSubject.asObservable();
  protected _entity$ = this.entitySubject.asObservable();
  protected _loadCount = 0;

  // filter subject
  protected _filterSubject = new BehaviorSubject<any>({});
  private _filterSubscription: Subscription;

  get filterSubject() {
    return this._filterSubject;
  }

  get loadCount() {
    return this._loadCount;
  }

  get isLoading() {
    return this._loadCount > 0;
  }

  get entity$() {
    return this._entity$;
  }

  get entity() {
    return this.entitySubject.value;
  }

  get entities$() {
    return this._entities$;
  }

  constructor(protected rpcCrud: JsonRpcCrudT, protected modelType: Type<EntityT>) {
    this.rpcCrud = rpcCrud;
    let firstLoad = true;
    this._filterSubject.subscribe((filter) => {
      if (firstLoad) {
        this.loadList();
        firstLoad = false;
      }
    });
  }

  reset() {
    this._loadCount = 0;
    this.entitiesSubject.next([]);
    this._filterSubject.next({});
    this.entitySubject.next(null);
  }

  loadList() {
    this.dismissGetSubject.next();
    this.dismissGetListSubject.next();
    this._loadCount += 1;
    this.rpcCrud
      .getList(this.filterSubject.value)
      .pipe(
        takeUntil(this.dismissGetListSubject),
        finalize(() => {
          if (this._loadCount > 0) this._loadCount -= 1;
        }),
      )

      .subscribe((list) => {
        this.entitiesSubject.next(list);
      });
  }

  select(entity: EntityListT) {
    this.selectById(entity._id);
  }

  selectNew(entity: EntityT = new this.modelType()) {
    const newEntity = entity.clone();
    delete newEntity._id;
    this.entitySubject.next(newEntity);
  }

  protected selectById(id: number) {
    this.dismissGetSubject.next();
    this._loadCount += 1;
    this.rpcCrud
      .getById(id)
      .pipe(
        takeUntil(this.dismissGetSubject),
        finalize(() => {
          if (this._loadCount > 0) this._loadCount -= 1;
        }),
      )

      .subscribe((entity) => {
        const model = new this.modelType().map(entity);
        this.entitySubject.next(new this.modelType().map(entity));
      });
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

  create(formValues): Observable<EntityT> {
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
    this.dismissUpdateCreateSubject.next();
    this.dismissDeleteSubject.next();
    this.dismissGetListSubject.next();
    this.dismissGetSubject.next();
  }
}
