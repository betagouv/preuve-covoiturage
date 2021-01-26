import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { finalize, takeUntil, debounceTime } from 'rxjs/operators';

import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';
import { PaginationState } from './PaginationState';
import { StoreLoadingState } from './StoreLoadingState';

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

  protected _listLoadingState = new BehaviorSubject<StoreLoadingState>(StoreLoadingState.Off);

  // content
  protected _entities$ = this.entitiesSubject.asObservable();
  protected _pagination$ = this.paginationSubject.asObservable();
  protected _entity$ = this.entitySubject.asObservable();
  protected _loadCount = 0;
  protected _isLoaded = false;
  protected __debounceTimeId = 0;
  // filter subjectentities
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

  get isLoaded(): boolean {
    return this._isLoaded;
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

  get finalFilterValue(): any {
    return this.filterSubject.value;
  }

  get listLoadingState$(): Observable<StoreLoadingState> {
    return this._listLoadingState.asObservable();
  }

  constructor(protected rpcGetList: JsonRpcGetListT) {
    this.rpcGetList = rpcGetList;
    this._setupFilterSubject();
  }

  reset(): void {
    this._loadCount = 0;
    this.entitiesSubject.next([]);
    this._filterSubject.next({});
    this.entitySubject.next(null);
  }

  loadList(debounce = 300, updateLoadcount = true): Observable<StoreLoadingState> {
    clearTimeout(this.__debounceTimeId);
    this._isLoaded = false;

    this._listLoadingState.next(StoreLoadingState.Off);

    if (debounce > 0) {
      this._listLoadingState.next(StoreLoadingState.Debounce);
      this.__debounceTimeId = setTimeout(() => {
        this.loadList(0, false);
      }, debounce) as any;
    } else {
      if (!this.dismissGetSubject) return;
      this.dismissGetSubject.next();
      this.dismissGetListSubject.next();
      if (updateLoadcount) this._loadCount++;
      this._listLoadingState.next(StoreLoadingState.LoadStart);
      this.rpcGetList
        .getList(this.finalFilterValue)
        .pipe(
          takeUntil(this.dismissGetListSubject),
          finalize(() => {
            this._listLoadingState.next(StoreLoadingState.LoadComplete);
            if (this._loadCount > 0 && updateLoadcount) this._loadCount -= 1;
          }),
        )
        .subscribe((list) => {
          this.entitiesSubject.next(list.data);
          this._isLoaded = true;

          this.paginationSubject.next(list.meta && list.meta.pagination ? list.meta.pagination : defaultPagination());
        });
    }

    return this._listLoadingState.asObservable();
  }

  dismissAllRpcActions(): void {
    this.dismissGetListSubject.next();
    this.dismissGetSubject.next();
  }

  protected _setupFilterSubject() {
    let firstLoad = true;

    this._filterSubject.pipe(debounceTime(100)).subscribe((filt) => {
      if (firstLoad || filt !== null) {
        console.log(this, 'refresh from filter');
        this.loadList();
        firstLoad = !firstLoad || !!filt;
      }
    });
  }
}
