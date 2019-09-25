import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { IncentiveTimeRuleInterface } from '~/core/entities/campaign/ux-format/incentive-filters';
import { CAMPAIGN_RULES_MAX_DISTANCE } from '~/core/const/campaign/rules.const';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-filters-form',
  templateUrl: './filters-form.component.html',
  styleUrls: ['./filters-form.component.scss', '../../campaign-sub-form.scss'],
})
export class FiltersFormComponent extends DestroyObservable implements OnInit {
  @Input() campaignForm: FormGroup;

  tripClassKeys = Object.keys(TripRankEnum);
  maxDistance = CAMPAIGN_RULES_MAX_DISTANCE;

  constructor(private _formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.initTargetChangeDetection();
  }

  get filtersForm(): FormGroup {
    return <FormGroup>this.campaignForm.get('filters');
  }

  get controls() {
    return this.filtersForm.controls;
  }

  get forDriverControl(): FormControl {
    return <FormControl>this.campaignForm.get('ui_status').get('for_driver');
  }

  get forPassengerControl(): FormControl {
    return <FormControl>this.campaignForm.get('ui_status').get('for_passenger');
  }

  get forTripControl(): FormControl {
    return <FormControl>this.campaignForm.get('ui_status').get('for_trip');
  }

  get timeCtrlArray(): FormArray {
    return <FormArray>this.filtersForm.get('time');
  }

  addTimeFilter() {
    this.timeCtrlArray.push(this._formBuilder.control(null, Validators.required));
  }

  removeTimeFilter(idx) {
    this.timeCtrlArray.removeAt(idx);
  }

  get showDateLabel() {
    let label = '';
    const weekDays = this.filtersForm.get('weekday').value;
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
      if (weekDays.length > 0) {
        label += ' <br>';
      }
      label += ' De ';
      label += timeRanges
        .map((timeRange: IncentiveTimeRuleInterface) => {
          if (!timeRange || !timeRange.start || !timeRange.end) {
            return '';
          }
          return `${timeRange.start.replace(':', 'h')} à ${timeRange.end.replace(':', 'h')}`;
        })
        .join(', ');
    }
    return label;
  }

  get showDistanceLabel(): string {
    const range = this.filtersForm.get('distance_range').value;
    if (range && (range.length < 2 || range === [0, 0])) {
      return '';
    }
    if (range[1] >= CAMPAIGN_RULES_MAX_DISTANCE) {
      return `A partir de ${range[0]} km`;
    }
    if (range[0] < 1) {
      return `Jusqu'à ${range[1]} km`;
    }
    return `De ${range[0]} à ${range[1]} km`;
  }

  showTripClassLabel(): string {
    const tripClass = this.filtersForm.get('rank').value;
    if (!tripClass) {
      return '';
    }
    return tripClass.join(', ');
  }

  showTargetLabel(): string {
    let label = '';
    const forDriver = this.forDriverControl.value;
    const forPassenger = this.forPassengerControl.value;
    const forTrip = this.forTripControl.value;
    const onlyAdult = this.campaignForm.get('only_adult').value;

    if (!(forDriver || forPassenger || forTrip)) {
      return '';
    }

    if (forDriver) {
      label += 'Conducteurs';
    }
    if (forPassenger) {
      label += forDriver ? ' et passagers' : 'Passagers';
      if (onlyAdult) {
        label += ', majeurs uniquement';
      }
    }
    if (forTrip) {
      label += 'Trajets';
      if (onlyAdult) {
        label += ', passagers majeurs uniquement';
      }
    }
    return label;
  }

  showOperatorsLabel(): string {
    let label = '';
    const operators = this.filtersForm.get('operator_ids').value;
    if (operators) {
      const multipleOperators = operators.length > 1;
      label += `${operators.length} opérateur${multipleOperators ? 's' : ''}
      participant${multipleOperators ? 's' : ''} à la campagne`;
    }
    return label;
  }

  isTimeCtrlArrayTouched() {
    for (const control of this.timeCtrlArray.controls) {
      if (!control.valid && control.touched) {
        return true;
      }
    }
    return false;
  }

  private initTargetChangeDetection() {
    this.forDriverControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((checked) => {
      if (checked) {
        this.forTripControl.setValue(false);
        if (!this.forPassengerControl.value) {
          this.campaignForm.get('only_adult').setValue(null);
        }
      }
    });
    this.forPassengerControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((checked) => {
      if (checked) {
        this.forTripControl.setValue(false);
      } else if (this.forDriverControl.value) {
        this.campaignForm.get('only_adult').setValue(null);
      }
    });
    this.forTripControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((checked) => {
      if (checked) {
        this.forPassengerControl.setValue(false);
        this.forDriverControl.setValue(false);
      }
    });
  }
}
