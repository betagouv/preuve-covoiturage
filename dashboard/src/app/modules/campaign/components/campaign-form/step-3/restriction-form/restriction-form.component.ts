import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-restriction-form',
  templateUrl: './restriction-form.component.html',
  styleUrls: ['./restriction-form.component.scss'],
})
export class RestrictionFormComponent implements OnInit {
  @Input() restrictionformGroup: FormGroup;

  constructor() {}

  ngOnInit() {
    this.initValidators();
  }

  get controls() {
    return this.restrictionformGroup.controls;
  }

  initValidators() {
    this.restrictionformGroup.get('quantity').setValidators([Validators.required, Validators.min(0)]);
    this.restrictionformGroup.get('is_driver').setValidators(Validators.required);
    this.restrictionformGroup.get('period').setValidators(Validators.required);
  }
}
