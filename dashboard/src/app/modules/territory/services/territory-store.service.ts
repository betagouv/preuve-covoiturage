import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { TerritoryInterface } from '../../../../../../shared/territory/common/interfaces/TerritoryInterface';
import { PaginationState } from '../../../core/services/store/PaginationState';
import { StoreLoadingState } from '../../../core/services/store/StoreLoadingState';

@Injectable({
  providedIn: 'root',
})
export class TerritoryStoreService {
  _loadCount: number;
  _isError: boolean;
  constructor(protected territoryApi: TerritoryApiService) {
    this.loadList();
  }

  protected entitiesSubject = new BehaviorSubject<TerritoryInterface[]>([]);
  protected paginationSubject = new BehaviorSubject<PaginationState>({
    total: 0,
    limit: 0,
    offset: 0,
  });

  protected _entities$ = this.entitiesSubject.asObservable();
  protected _pagination$ = this.paginationSubject.asObservable();
  protected _isLoaded = false;
  protected _listLoadingState = new BehaviorSubject<StoreLoadingState>(StoreLoadingState.Off);
  protected _filterSubject = new BehaviorSubject<any>(null);

  get entities$(): Observable<TerritoryInterface[]> {
    return this._entities$;
  }

  get pagination$(): Observable<PaginationState> {
    return this._pagination$;
  }

  get filterSubject(): BehaviorSubject<any> {
    return this._filterSubject;
  }

  get finalFilterValue(): any {
    return this.filterSubject.value;
  }

  get isLoading(): boolean {
    return this._isLoaded;
  }

  loadList(): Observable<StoreLoadingState> {
    this._isLoaded = false;
    this._listLoadingState.next(StoreLoadingState.Off);

    this._listLoadingState.next(StoreLoadingState.LoadStart);
    this.territoryApi
      .getList(this.finalFilterValue)
      .pipe(
        finalize(() => {
          this._listLoadingState.next(StoreLoadingState.LoadComplete);
        }),
      )
      .subscribe(
        (list) => {
          this.entitiesSubject.next(list.data);
          this._isLoaded = true;
          this._isError = false;

          this.paginationSubject.next(list.meta && list.meta.pagination ? list.meta.pagination : defaultPagination());
        },
        (error) => {
          this._isError = true;
          this._isLoaded = true;
        },
      );
    return this._listLoadingState.asObservable();
  }
}

function defaultPagination(): PaginationState {
  return {
    total: 0,
    limit: 0,
    offset: 0,
  };
}
