import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { debounceTime, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
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

  public territories: Territory[];
  public territoriesToShow: Territory[];
  public territoriesFiltered: Territory[];

  PAGE_SIZE = 10;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(private _territoryStoreService: TerritoryStoreService) {
    super();
  }

  protected territories$: Observable<Territory[]>;

  ngOnInit() {
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

  ngAfterViewInit(): void {
    merge(
      this.territories$,
      this._filterLiteral.pipe(
        debounceTime(300),
        tap(() => (this.paginator.pageIndex = 0)),
      ),
      this.paginator.page,
    )
      .pipe(
        switchMap(() => {
          const page = this.paginator.pageIndex;
          const start = Number(page) * this.PAGE_SIZE;
          const end = Number(page) * this.PAGE_SIZE + this.PAGE_SIZE;
          this.territoriesFiltered = this.territories
            .filter((t) => t.name.toLowerCase().includes(this._filterLiteral.value))
            .sort((a, b) => a.name.localeCompare(b.name));
          return of(this.territoriesFiltered.slice(start, end));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => {
        this.territoriesToShow = data;
      });
  }

  get countTerritories(): number {
    return this.territoriesFiltered && this.territoriesFiltered.length;
  }

  pipeFilter(literal: any) {
    this._filterLiteral.next(literal);
  }

  pipeEdit(territory: any) {
    this._territoryStoreService.select(territory);
  }

  close() {
    this.showForm = false;
  }

  loadTerritories() {
    this._territoryStoreService.loadList();
  }
}
