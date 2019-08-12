import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TripClass } from '~/core/entities/trip/trip-class';
import { IncentiveTimeRule } from '~/core/entities/campaign/incentive-rules';

@Component({
  selector: 'app-rules-form',
  templateUrl: './rules-form.component.html',
  styleUrls: ['./rules-form.component.scss'],
})
export class RulesFormComponent implements OnInit {
  @Input() campaignForm: FormGroup;

  tripClassKeys = Object.keys(TripClass);

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {
    this.initRulesForm();
  }

  get rulesForm() {
    return this.campaignForm.get('rules');
  }

  get timeCtrlArray(): FormArray {
    return <FormArray>this.rulesForm.get('time');
  }

  addTimeFilter() {
    this.timeCtrlArray.push(this._formBuilder.control(null, Validators.required));
  }

  removeTimeFilter(idx) {
    this.timeCtrlArray.removeAt(idx);
  }

  showDateLabel() {
    let label = '';
    const weekDays = this.rulesForm.get('weekday').value;
    if (!weekDays) {
      return '';
    }
    label += weekDays
      .map((weekDay: number) => {
        switch (weekDay) {
          case 0:
            return 'Lundi';
          case 1:
            return 'Mardi';
          case 2:
            return 'Mercredi';
          case 3:
            return 'Jeudi';
          case 4:
            return 'Vendredi';
          case 5:
            return 'Samedi';
          case 6:
            return 'Dimanche';
          default:
            return '';
        }
      })
      .join(', ');

    const timeRanges = this.timeCtrlArray.value;
    if (timeRanges && timeRanges.length > 0) {
      label += ' De ';
      label += timeRanges
        .map((timeRange: IncentiveTimeRule) => {
          if (!timeRange || !timeRange.start || !timeRange.end) {
            return '';
          }
          return `${timeRange.start.replace(':', 'h')} à ${timeRange.end.replace(':', 'h')}`;
        })
        .join(', ');
    }
    return label;
  }

  showTripClassLabel(): string {
    const tripClass = this.rulesForm.get('ranks').value;
    if (!tripClass) {
      return '';
    }
    return tripClass.join(', ');
  }

  showTargetLabel(): string {
    let label = '';
    if (this.rulesForm.get('forDriver').value) {
      label += 'Conducteurs';
    }
    if (this.rulesForm.get('forPassenger').value) {
      label += this.rulesForm.get('forDriver').value ? ' et passagers' : 'Passagers';
    }
    if (this.rulesForm.get('onlyMajorPeople').value) {
      label += ' majeurs uniquement';
    }
    return label;
  }

  private initRulesForm() {
    this.campaignForm.controls.rules = this._formBuilder.group({
      weekday: [],
      time: this._formBuilder.array([]),
      range: [],
      ranks: [],
      onlyMajorPeople: [],
      forDriver: [],
      forPassenger: [],
    });
  }
}
