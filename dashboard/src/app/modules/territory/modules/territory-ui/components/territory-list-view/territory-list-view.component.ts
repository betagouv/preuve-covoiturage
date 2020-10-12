import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material';

import { Territory } from '~/core/entities/territory/territory';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryStoreService } from '~/modules/territory/services/territory-store.service';

@Component({
  selector: 'app-territory-list-view',
  templateUrl: './territory-list-view.component.html',
  styleUrls: ['./territory-list-view.component.scss'],
})
export class TerritoryListViewComponent extends DestroyObservable implements OnInit, AfterViewInit {
  private _filterLiteral = new BehaviorSubject('');
  showForm = false;
  territoryToEdit: Territory = null;

  public territories: Territory[] = [];
  public territoriesToShow: Territory[];
  public territoriesFiltered: Territory[];

  ELEMENT_PER_PAGE = 10;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  private _countTerritories = 0;

  constructor(private _territoryStoreService: TerritoryStoreService) {
    super();
  }

  protected territories$: Observable<Territory[]>;

  ngOnInit(): void {
    this.territories$ = this._territoryStoreService.entities$.pipe(
      filter((data) => !!data),
      tap((territories) => (this.territories = territories)),
    );

    this._territoryStoreService.entity$
      .pipe(
        filter((data) => !!data),
        takeUntil(this.destroy$),
      )
      .subscribe((territory) => {
        this.territoryToEdit = territory;
        this.showForm = true;
      });

    this.loadTerritories();
  }

  showAddForm(): void {
    this._territoryStoreService.selectNew();
  }

  ngAfterViewInit(): void {
    // merge(
    //   this._filterLiteral.pipe(
    //     debounceTime(300),
    //     tap(() => (this.paginator.pageIndex = 0)),
    //   ),
    // )

    merge(
      this._filterLiteral.pipe(
        debounceTime(300),
        tap(() => (this.paginator.pageIndex = 0)),
      ),
      this.paginator.page,
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() =>
        this._territoryStoreService.filterSubject.next({
          skip: this.paginator.pageIndex * this.ELEMENT_PER_PAGE,
          limit: this.ELEMENT_PER_PAGE,
          search: this._filterLiteral.value ? this._filterLiteral.value : undefined,
        }),
      );

    this.territories$.pipe(takeUntil(this.destroy$)).subscribe((data) => (this.territoriesToShow = data));
    this._territoryStoreService.pagination$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pagination) => (this._countTerritories = pagination.total));

    // merge(this.territories$)
    //   .pipe(
    //     switchMap(() => {
    //       const page = this.paginator.pageIndex;
    //       const start = Number(page) * this.ELEMENT_PER_PAGE;
    //       const end = Number(page) * this.ELEMENT_PER_PAGE + this.ELEMENT_PER_PAGE;

    //       this.territoriesFiltered = this.territories
    //         .filter((t) => t.name.toLowerCase().includes(this._filterLiteral.value))
    //         .sort((a, b) => a.name.localeCompare(b.name));
    //       return of(this.territoriesFiltered.slice(start, end));
    //     }),
    //     takeUntil(this.destroy$),
    //   )
    //   .subscribe((data) => {
    //     this.territoriesToShow = data;
    //   });
  }

  get countTerritories(): number {
    return this._countTerritories;
  }

  pipeFilter(literal: any): void {
    this._filterLiteral.next(literal);
  }

  onEdit(territory: any): void {
    this._territoryStoreService.select(territory);
  }

  close(): void {
    this.showForm = false;
  }

  loadTerritories(): void {
    this._territoryStoreService.loadList();
  }
}
