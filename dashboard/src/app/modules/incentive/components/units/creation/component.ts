import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import {
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';


@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class IncentiveUnitCreationComponent implements OnInit {
  public incentiveUnitForm = this.fb.group({
    name: ['', Validators.required],
    short_name: ['', Validators.required],
    description: [''],
    precision: [0, Validators.required],
    financial: [false],
  });

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public fb: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    if (this.config.data) {
      this.incentiveUnitForm.patchValue(this.config.data);
    }
  }

  onSubmit() {
    // slugify name to shortname
    this.incentiveUnitForm.setValue({ ...this.incentiveUnitForm.value,
      short_name: this.incentiveUnitForm.value.name.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '_') });
    this.ref.close(this.incentiveUnitForm.value);
  }
}
