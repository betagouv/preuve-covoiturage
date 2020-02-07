import { BehaviorSubject, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';

export abstract class GetListStore<
  EntityT,
  EntityListT = EntityT,
  JsonRpcGetListT extends JsonRpcGetList<EntityT, EntityListT> = JsonRpcGetList<EntityT, EntityListT>
> {
  protected entitiesSubject = new BehaviorSubject<EntityListT[]>([]);
  protected entitySubject = new BehaviorSubject<EntityT>(null);

  // dismiss subject triggered in order to cancel current rpc calls
  protected dismissGetSubject = new Subject();
  protected dismissGetListSubject = new Subject();

  // content
  protected _entities$ = this.entitiesSubject.asObservable();
  protected _entity$ = this.entitySubject.asObservable();
  protected _loadCount = 0;

  // filter subject
  protected _filterSubject = new BehaviorSubject<any>(null);

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

  constructor(protected rpcGetList: JsonRpcGetListT) {
    this.rpcGetList = rpcGetList;
    let firstLoad = true;

    this._filterSubject.subscribe((filt) => {
      if (firstLoad && (filt !== null || !firstLoad)) {
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
    this.rpcGetList
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

  dismissAllRpcActions() {
    this.dismissGetListSubject.next();
    this.dismissGetSubject.next();
  }
}
