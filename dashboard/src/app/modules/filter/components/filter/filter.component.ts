import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { tap } from 'rxjs/operators';
import * as _ from 'lodash';

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
  @Output() filter = new EventEmitter();

  @ViewChild('townInput', { static: false }) townInput: ElementRef;

  constructor(private fb: FormBuilder) {}

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

  public onCloseClick() {
    this.hideFilter.emit();
  }

  public filterClick() {
    console.log(this.filterForm.value);
  }

  public reinitializeClick() {
    this.filterForm.reset();
  }
}
