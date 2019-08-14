import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { FilterService } from '~/core/services/filter.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {
  public filterForm: FormGroup;
  public _showFilter = false;

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
