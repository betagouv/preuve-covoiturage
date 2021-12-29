import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { TerritoryInterface } from '../../../../../../shared/territory/common/interfaces/TerritoryInterface';
import { PaginationState } from '../../../core/services/store/PaginationState';
import { StoreLoadingState } from '../../../core/services/store/StoreLoadingState';

@Injectable({
  providedIn: 'root',
})
export class TerritoryStoreService {
  constructor(protected territoryApi: TerritoryApiService) {
    this._setupFilterSubject();
  }

  private entitiesSubject = new BehaviorSubject<TerritoryInterface[]>([]);
  private paginationSubject = new BehaviorSubject<PaginationState>({
    total: 0,
    limit: 0,
    offset: 0,
  });

  private _isError: boolean;
  private _isLoaded = false;

  private _entities$ = this.entitiesSubject.asObservable();
  private _pagination$ = this.paginationSubject.asObservable();

  private _listLoadingState = new BehaviorSubject<StoreLoadingState>(StoreLoadingState.Off);
  private _filterSubject = new BehaviorSubject<any>(null);

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
    return !this._isLoaded;
  }

  private _setupFilterSubject() {
    let firstLoad = true;

    this._filterSubject.pipe(debounceTime(100)).subscribe((filt) => {
      if (firstLoad || filt !== null) {
        this.loadList();
        firstLoad = !firstLoad || !!filt;
      }
    });
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
