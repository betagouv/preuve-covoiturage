import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/api';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class IncentiveParameterCreationComponent implements OnInit {
  public error = null;
  public incentiveParameterForm = this.fb.group({
    varname: ['', Validators.required],
    label: ['', Validators.required],
    helper: ['', Validators.required],
    formula: ['', Validators.required],
    internal: false,
  });

  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig, public fb: FormBuilder) {}

  ngOnInit(): void {
    if (this.config.data) {
      this.incentiveParameterForm.patchValue(this.config.data);
    }
  }

  onSubmit() {
    this.incentiveParameterForm.setValue({
      ...this.incentiveParameterForm.value,
      varname: this.incentiveParameterForm.value.label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '_'),
    });
    this.ref.close(this.incentiveParameterForm.value);
  }
}
