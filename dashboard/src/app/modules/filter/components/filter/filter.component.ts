import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { FilterService } from '~/core/services/filter.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  animations: [
    trigger('collapse', [
      state(
        'open',
        style({
          'max-height': '1800px',
        }),
      ),
      state(
        'closed',
        style({
          'max-height': '0',
          display: 'none',
        }),
      ),
      transition('open => closed', [style({ 'margin-top': '30px' }), animate('0.3s')]),
      transition('closed => open', [animate('0s')]),
    ]),
  ],
})
export class FilterComponent implements OnInit {
  public filterForm: FormGroup;
  public _showFilter = false;
  public classes = ['A', 'B', 'C'];
  public tripStatusList = [
    {
      id: 'pending',
      french: 'En cours',
    },
    {
      id: 'active',
      french: 'Actif',
    },
    {
      id: 'error',
      french: 'Anomalie',
    },
  ];

  public days = [
    {
      id: 0,
      french: 'Lundi',
    },
    {
      id: 1,
      french: 'Mardi',
    },
    {
      id: 2,
      french: 'Mercredi',
    },
    {
      id: 3,
      french: 'Jeudi',
    },
    {
      id: 4,
      french: 'Vendredi',
    },
    {
      id: 5,
      french: 'Samedi',
    },
    {
      id: 6,
      french: 'Dimanche',
    },
  ];

  @Input() set showFilter(showFilter: boolean) {
    this._showFilter = showFilter;
  }

  @Output() filterNumber = new EventEmitter();
  @Output() hideFilter = new EventEmitter();

  @ViewChild('townInput', { static: false }) townInput: ElementRef;

  constructor(private fb: FormBuilder, private filterService: FilterService) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      campaign: [null],
      startDate: [null],
      endDate: [null],
      startTime: [null],
      endTime: [null],
      days: [null],
      towns: [null],
      minDistance: [null],
      maxDistance: [null],
      classes: [null],
      status: [null],
      operators: [null],
    });
  }

  public onCloseClick(): void {
    this.hideFilter.emit();
  }

  public filterClick(): void {
    this.filterService.setFilter(this.filterForm.value);
    this.filterNumber.emit(this.countFilters);
    this.hideFilter.emit();
  }

  public reinitializeClick(): void {
    this.filterForm.reset();
    this.filterNumber.emit(0);
  }

  public get countFilters(): number {
    return Object.values(this.filterForm.value).filter((val) => !!val).length;
  }
}
