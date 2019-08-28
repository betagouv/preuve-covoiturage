import { saveAs } from 'file-saver';
import { Component, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { LazyLoadEvent, MessageService } from 'primeng/api';

import { AuthenticationService } from '~/applicativeService/authentication/auth.service';
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
      state(
        'void',
        style({
          transform: 'translateX(-10%)',
          opacity: 0,
        }),
      ),
      state(
        'active',
        style({
          transform: 'translateX(0)',
          opacity: 1,
        }),
      ),
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
  total = 0;
  perPage = 25;
  loading = true;
  @ViewChild('dt') dt;
  private filters;

  constructor(
    private journeyService: JourneyService,
    private authentificationService: AuthenticationService,
    private translationService: TranslationService,
    private messageService: MessageService,
    private ts: TableService,
  ) {
    this.setColumns();
  }

  applyFilters(mainFilters) {
    if (!mainFilters) return;

    Object.keys(mainFilters).forEach((key) => {
      this.dt.filter(mainFilters[key]['value'], mainFilters[key]['colName'], mainFilters[key]['filterType']);
    });

    this.applyDefaultSort(this.dt);

    this.filters = this.journeyService.formatFiltersFromLazyEvent(this.dt);
  }

  lazyLoad(event: LazyLoadEvent) {
    const eventBeforeFormat = this.applyDefaultSort(event);
    const filters = this.journeyService.formatFiltersFromLazyEvent(eventBeforeFormat);
    this.get(filters);
  }

  getSubArray(a, b) {
    return [a, b];
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

  export(type) {
    this.journeyService.export(type, this.filters).subscribe((res) => {
      saveAs(res, `journeys.${type}`);
    });
  }

  delete(root, id) {
    this.journeyService.delete(id).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Trajet supprimé',
      });
    });
  }

  isNaN(value) {
    return isNaN(value);
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

  private get(filters: any[any] = []) {
    this.loading = true;
    this.journeyService.get(filters).subscribe((response: ApiResponse) => {
      this.setTotal(response.meta);
      this.journeys = response.data.map((j) => {
        // use calc_distance on missing distance
        if (j.passenger.distance === 0 && j.passenger.calc_distance) {
          j.passenger.distance = j.passenger.calc_distance;
        }

        // translate operator name
        if (j.operator && j.operator.nom_commercial === 'hidden') {
          j.operator.nom_commercial = 'Masqué';
        }
        return j;
      });
      this.loading = false;
    });
  }

  private applyDefaultSort(event: LazyLoadEvent) {
    const evt = { ...event };

    if (!evt.sortField) {
      evt.sortField = 'passenger.start.datetime';
      evt.sortOrder = -1;
    }

    return evt;
  }

  private setTotal(meta) {
    if (meta.hasOwnProperty('pagination')) {
      this.total = meta['pagination']['total'];
      this.perPage = meta['pagination']['per_page'];
    }
  }
}
