import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, Validators, AbstractControl } from '@angular/forms';

import {
  RESTRICTION_PERIODS,
  RESTRICTION_PERIODS_FR,
  RestrictionPeriodsEnum,
} from '~/core/enums/campaign/restrictions.enum';

@Component({
  selector: 'app-restriction-form',
  templateUrl: './restriction-form.component.html',
  styleUrls: ['./restriction-form.component.scss'],
})
export class RestrictionFormComponent implements OnInit {
  @Input() restrictionformGroup: FormGroup;
  @Input() unit = 'Points';
  @Output() add: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  @Output() cancel = new EventEmitter();

  restrictionPeriods = RESTRICTION_PERIODS;

  constructor() {}

  ngOnInit(): void {
    this.initValidators();
  }

  get unitLabel(): string {
    return `${this.unit.charAt(0).toUpperCase() + this.unit.slice(1)}s`;
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.restrictionformGroup.controls;
  }

  public getFrenchLabel(val: RestrictionPeriodsEnum): string {
    return RESTRICTION_PERIODS_FR[val];
  }

  private initValidators(): void {
    this.restrictionformGroup.get('quantity').setValidators([Validators.required, Validators.min(0)]);
    this.restrictionformGroup.get('is_driver').setValidators(Validators.required);
    this.restrictionformGroup.get('period').setValidators(Validators.required);
    this.restrictionformGroup.get('unit').setValidators(Validators.required);
  }
}
