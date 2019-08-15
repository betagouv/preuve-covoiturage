import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/api';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class IncentiveWeekdayFilterComponent implements OnInit {
  public filter;
  public filterControl = this.fb.control([]);

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig, public fb: FormBuilder) {}

  get weekdays() {
    return this.filter.weekdays;
  }

  ngOnInit(): void {
    if (this.config.data && 'value' in this.config.data) {
      this.filterControl.patchValue(this.config.data.value);
    }
    this.filter = this.config.data.filter;
  }

  onSubmit() {
    this.ref.close(this.filter.export(this.filterControl.value));
  }
}
