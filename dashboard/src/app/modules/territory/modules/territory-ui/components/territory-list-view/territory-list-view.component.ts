import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, merge, of } from 'rxjs';
import { debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material';

import { TerritoryService } from '~/modules/territory/services/territory.service';
import { Territory } from '~/core/entities/territory/territory';
import { DestroyObservable } from '~/core/components/destroy-observable';

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

  constructor(private _territoryService: TerritoryService) {
    super();
  }

  ngOnInit() {
    this.loadTerritories();
    this._territoryService.territories$.pipe(takeUntil(this.destroy$)).subscribe((territories) => {
      this.territories = territories;
    });
  }

  ngAfterViewInit(): void {
    merge(
      this._territoryService.territories$,
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
          this.territoriesFiltered = this.territories.filter((t) =>
            t.name.toLowerCase().includes(this._filterLiteral.value),
          );
          return of(this.territoriesFiltered.slice(start, end));
        }),
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
    this.territoryToEdit = territory;
    this.showForm = true;
  }

  close() {
    this.loadTerritories();
    this.showForm = false;
  }

  loadTerritories() {
    this._territoryService.load().subscribe();
  }
}
