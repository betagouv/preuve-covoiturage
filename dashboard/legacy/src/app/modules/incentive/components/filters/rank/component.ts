import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/api';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class IncentiveRankFilterComponent implements OnInit {
  public filter;
  public filterControl = this.fb.control([], Validators.required);

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig, public fb: FormBuilder) {}

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
