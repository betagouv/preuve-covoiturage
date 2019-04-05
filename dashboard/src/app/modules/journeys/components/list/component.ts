import { Component, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { LazyLoadEvent, SortEvent } from 'primeng/api';

import { AuthenticationService } from '~/applicativeService/authentication/service';
import { Journey } from '~/entities/database/journey';
import { TranslationService } from '~/shared/services/translationService';
import { TableService } from '~/shared/services/tableService';
import { ApiResponse } from '~/entities/responses/apiResponse';

import { JourneyService } from '../../services/journeyService';
import { JOURNEY_HEADER } from '../../config/header';

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
  headList = JOURNEY_HEADER.main.journey;
  selectedHeadList = JOURNEY_HEADER.selection.journey;
  driverPassengerHeadList = JOURNEY_HEADER.main.driverPassenger;
  sortList = JOURNEY_HEADER.sort.journey;

  columns = [];
  selectedColumns = [];
  subColumns = [];
  subTableTitles = ['Conducteur', 'Passager'];
  total = 30;
  perPage = 10;
  loading = true;

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
    Object
      .keys(mainFilters)
      .forEach((key) => {
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


  private get(filters: any[any] = []) {
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

  getSortableField(field) {
    if (this.sortList.indexOf(field) !== -1) {
      if (field === 'passenger.start.date') {
        return 'passenger.start.datetime';
      }
      return field;
    }
    return null;
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

  hasAnyGroup(groups: string[]) {
    const group = this.authentificationService.hasAnyGroup(groups);
    return !!group;
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

  isNaN(value) {
    return isNaN(value);
  }

  private setTotal(meta) {
    if (meta.hasOwnProperty('pagination')) {
      this.total = meta['pagination']['total'];
      this.perPage = meta['pagination']['per_page'];
    }
  }
}
