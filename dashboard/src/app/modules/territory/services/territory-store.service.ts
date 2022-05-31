import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, finalize, skip } from 'rxjs/operators';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { TerritoryGroupInterface } from '~/shared/territory/common/interfaces/TerritoryInterface';
import { PaginationState } from '../../../core/services/store/PaginationState';
import { StoreLoadingState } from '../../../core/services/store/StoreLoadingState';

@Injectable({
  providedIn: 'root',
})
export class TerritoryStoreService {
  constructor(protected territoryApi: TerritoryApiService) {
    this._setupFilterSubject();
  }

  private entitiesSubject = new BehaviorSubject<TerritoryGroupInterface[]>([]);

  private readonly DEFAULT_PAGINATION = {
    total: 0,
    limit: 0,
    offset: 0,
  };

  private paginationSubject = new BehaviorSubject<PaginationState>(this.DEFAULT_PAGINATION);

  private _isError: boolean;
  private _isLoaded = false;

  private _entities$ = this.entitiesSubject.asObservable();
  private _pagination$ = this.paginationSubject.asObservable();

  private _listLoadingState = new BehaviorSubject<StoreLoadingState>(StoreLoadingState.Off);
  private _filterSubject = new BehaviorSubject<any>(null);

  get entities$(): Observable<TerritoryGroupInterface[]> {
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
    return !this._isLoaded;
  }

  private _setupFilterSubject() {
    this._filterSubject.pipe(debounceTime(100), skip(1)).subscribe((filt) => {
      this.loadList();
    });
  }

  loadList(): Observable<StoreLoadingState> {
    this._isLoaded = false;
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

          this.paginationSubject.next(
            list.meta && list.meta.pagination ? list.meta.pagination : this.DEFAULT_PAGINATION,
          );
        },
        (error) => {
          this._isError = true;
          this._isLoaded = true;
        },
      );
    return this._listLoadingState.asObservable();
  }
}
