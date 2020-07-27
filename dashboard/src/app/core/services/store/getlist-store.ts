import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';

export interface PaginationState {
  limit: number;
  offset: number;
  total: number;
}

function defaultPagination(): PaginationState {
  return {
    total: 0,
    limit: 0,
    offset: 0,
  };
}

export abstract class GetListStore<
  EntityT,
  EntityListT = EntityT,
  JsonRpcGetListT extends JsonRpcGetList<EntityT, EntityListT> = JsonRpcGetList<EntityT, EntityListT>
> {
  protected entitiesSubject = new BehaviorSubject<EntityListT[]>([]);
  protected paginationSubject = new BehaviorSubject<PaginationState>({
    total: 0,
    limit: 0,
    offset: 0,
  });

  protected entitySubject = new BehaviorSubject<EntityT>(null);

  // dismiss subject triggered in order to cancel current rpc calls
  protected dismissGetSubject = new Subject();
  protected dismissGetListSubject = new Subject();

  // content
  protected _entities$ = this.entitiesSubject.asObservable();
  protected _pagination$ = this.paginationSubject.asObservable();
  protected _entity$ = this.entitySubject.asObservable();
  protected _loadCount = 0;

  // filter subject
  protected _filterSubject = new BehaviorSubject<any>(null);

  get filterSubject(): BehaviorSubject<any> {
    return this._filterSubject;
  }

  get loadCount(): number {
    return this._loadCount;
  }

  get isLoading(): boolean {
    return this._loadCount > 0;
  }

  get entity$(): Observable<EntityT> {
    return this._entity$;
  }

  get entity(): EntityT {
    return this.entitySubject.value;
  }

  get entities$(): Observable<EntityListT[]> {
    return this._entities$;
  }
  get pagination$(): Observable<PaginationState> {
    return this._pagination$;
  }

  constructor(protected rpcGetList: JsonRpcGetListT) {
    this.rpcGetList = rpcGetList;
    let firstLoad = true;

    this._filterSubject.subscribe((filt) => {
      if (firstLoad || filt !== null) {
        this.loadList();
        firstLoad = !firstLoad || !!filt;
      }
    });
  }

  reset(): void {
    this._loadCount = 0;
    this.entitiesSubject.next([]);
    this._filterSubject.next({});
    this.entitySubject.next(null);
  }

  loadList(): void {
    if (!this.dismissGetSubject) return;
    this.dismissGetSubject.next();
    this.dismissGetListSubject.next();
    this._loadCount += 1;
    this.rpcGetList
      .getList(this.filterSubject.value)
      .pipe(
        takeUntil(this.dismissGetListSubject),
        finalize(() => {
          if (this._loadCount > 0) this._loadCount -= 1;
        }),
      )
      .subscribe((list) => {
        this.entitiesSubject.next(list.data);

        this.paginationSubject.next(list.meta && list.meta.pagination ? list.meta.pagination : defaultPagination());
      });
  }

  dismissAllRpcActions(): void {
    this.dismissGetListSubject.next();
    this.dismissGetSubject.next();
  }
}
