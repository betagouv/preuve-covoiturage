import { BehaviorSubject, merge } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import { MatPaginator } from '@angular/material/paginator';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { Territory } from '~/core/entities/territory/territory';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryStoreService } from '~/modules/territory/services/territory-store.service';
@Component({
  selector: 'app-territory-list-view',
  templateUrl: './territory-list-view.component.html',
  styleUrls: ['./territory-list-view.component.scss'],
})
export class TerritoryListViewComponent extends DestroyObservable implements OnInit, AfterViewInit {
  public readonly PAGE_SIZE = 25;

  private _filterLiteral = new BehaviorSubject('');
  isFormVisible = false;
  territoryToEdit: Territory = null;

  // public territories: Territory[] = [];
  public territoriesToShow: Territory[];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  private _countTerritories = 0;

  constructor(private territoryStoreService: TerritoryStoreService) {
    super();
  }

  ngOnInit(): void {
    // bind and load all territories
    this.territoryStoreService.entities$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.territoriesToShow = data));
    this.loadTerritories();

    // load single entity
    this.territoryStoreService.unselect();
    this.territoryStoreService.entity$.subscribe((entity) => {
      this.territoryToEdit = entity;
      this.isFormVisible = !!entity;
    });
  }

  // onclick: select new
  onClickCreate(): void {
    this.territoryStoreService.selectNew();
  }

  ngAfterViewInit(): void {
    merge(
      this._filterLiteral.pipe(
        debounceTime(100),
        tap(() => (this.paginator.pageIndex = 0)),
      ),
      this.paginator.page,
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() =>
        this.territoryStoreService.filterSubject.next({
          offset: this.paginator.pageIndex * this.PAGE_SIZE,
          limit: this.PAGE_SIZE,
          search: this._filterLiteral.value ? this._filterLiteral.value : undefined,
        }),
      );

    this.territoryStoreService.pagination$
      .pipe(takeUntil(this.destroy$), debounceTime(100))
      .subscribe((pagination) => (this._countTerritories = pagination.total));
  }

  get countTerritories(): number {
    return this._countTerritories;
  }

  pipeFilter(literal: any): void {
    this._filterLiteral.next(literal);
  }

  onEdit(territory: any): void {
    this.territoryStoreService.select(territory);
  }

  onClose(): void {
    this.territoryStoreService.unselect();
  }

  loadTerritories(): void {
    this.territoryStoreService.loadList();
  }
}
