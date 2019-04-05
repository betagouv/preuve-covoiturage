import { Component, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { LazyLoadEvent } from 'primeng/api';

import { AuthenticationService } from '~/applicativeService/authentication/service';
import { HEADERS } from '~/config/headers';
import { Journey } from '~/entities/database/journey';
import { TranslationService } from '~/services/translationService';
import { TableService } from '~/services/tableService';
import { ApiResponse } from '~/entities/responses/apiResponse';

import { JourneyService } from '../../services/journeyService';


@Component({
  selector: 'app-journeys',
  templateUrl: 'template.html',
  animations: [
    trigger('rowExpansionTrigger', [
      state('void', style({
        transform: 'translateX(-10%)',
        opacity: 0,
      })),
      state('active', style({
        transform: 'translateX(0)',
        opacity: 1,
      })),
      transition('* <=> *', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
    ]),
  ],
  styleUrls: ['style.scss'],
})

export class JourneyListComponent {
  journeys;
  headList = HEADERS.journeys.main.journey;
  selectedHeadList = HEADERS.journeys.selection.journey;
  driverPassengerHeadList = HEADERS.journeys.main.driverPassenger;
  columns = [];
  selectedColumns = [];
  subColumns = [];
  subTableTitles = ['Conducteur', 'Passager'];
  total = 30;
  perPage = 10;
  loading;

  @ViewChild('dt') dt;

  constructor(
       private journeyService: JourneyService,
       private authentificationService: AuthenticationService,
       private translationService: TranslationService,
       private ts: TableService,
   ) {
    this.setColumns();
  }


  applyFilters(mainFilters) {
    Object.keys(mainFilters).forEach((key) => {
      this.dt.filter(mainFilters[key]['value'], mainFilters[key]['colName'], mainFilters[key]['filterType']);
    });
    const filters = this.journeyService.formatFiltersFromLazyEvent(this.dt);
    this.get(filters);
  }

  private setColumns() {
    for (const head of this.headList) {
      this.columns.push(this.ts.createColumn(head));
    }
    for (const head of this.selectedHeadList) {
      this.selectedColumns.push(this.ts.createColumn(head));
    }
    for (const head of this.driverPassengerHeadList) {
      this.subColumns.push(this.ts.createColumn(head));
    }
  }

  getSubArray(a, b) {
    return [a, b];
  }


  private get(filters:any[any] = []) {
    this.loading = true;
    this.journeyService.get(filters).subscribe(
        (response: ApiResponse) => {
          this.setTotal(response.meta);
          this.journeys = response.data;
          this.loading = false;
        },
        (error) => {
          // FIX: do nothing ?
        },
    );
  }


  getValue(journey: Journey, keyString) {
    return this.translationService.getTableValue(journey, keyString);
  }

  getKey(title: string) {
    return this.translationService.getTableKey(title);
  }

  hasPermission(permission: string) {
    return this.authentificationService.hasPermission(permission);
  }

  loadLazy(event: LazyLoadEvent) {
    const filters = this.journeyService.formatFiltersFromLazyEvent(event);
    this.get(filters);
  }

  delete(root, id) {
    this.journeyService.delete(id).subscribe(
        () => {
          this.get();
        },
        (error) => {
          // FIX: do nothing ?
        },
    );
    event.stopPropagation();
  }

  private setTotal(meta) {
    if (meta.hasOwnProperty('pagination')) {
      this.total = meta['pagination']['total'];
      this.perPage = meta['pagination']['per_page'];
    }
  }
}
