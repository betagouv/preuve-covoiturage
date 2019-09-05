import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import { TripClassEnum } from '~/core/enums/trip/trip-class.enum';
import { IncentiveTimeRule } from '~/core/entities/campaign/incentive-rules';
import { OperatorService } from '~/modules/operator/services/operator.service';
import { Operator } from '~/core/entities/operator/operator';
import { CAMPAIGN_RULES_MAX_DISTANCE } from '~/core/const/campaign/rules.const';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-rules-form',
  templateUrl: './rules-form.component.html',
  styleUrls: ['./rules-form.component.scss', '../campaign-sub-form.scss'],
})
export class RulesFormComponent extends DestroyObservable implements OnInit {
  @Input() campaignForm: FormGroup;

  tripClassKeys = Object.keys(TripClassEnum);
  maxDistance = CAMPAIGN_RULES_MAX_DISTANCE;

  constructor(private _formBuilder: FormBuilder, public operatorService: OperatorService) {
    super();
  }

  ngOnInit() {
    this.loadOperators();
    this.initTargetChangeDetection();
  }

  get rulesForm(): FormGroup {
    return <FormGroup>this.campaignForm.get('rules');
  }

  get controls() {
    return this.rulesForm.controls;
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

  get showDateLabel() {
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
      if (weekDays.length > 0) {
        label += ' <br>';
      }
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

  get showDistanceLabel(): string {
    const range = this.rulesForm.get('range').value;
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
    const tripClass = this.rulesForm.get('ranks').value;
    if (!tripClass) {
      return '';
    }
    return tripClass.join(', ');
  }

  showTargetLabel(): string {
    let label = '';
    const forDriver = this.rulesForm.get('forDriver').value;
    const forPassenger = this.rulesForm.get('forPassenger').value;
    const forTrip = this.rulesForm.get('forTrip').value;
    const onlyAdult = this.rulesForm.get('onlyAdult').value;

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
    const operators = this.rulesForm.get('operators').value;
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
    this.controls.forDriver.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((checked) => {
      if (checked) {
        this.controls.forTrip.setValue(null);
        if (!this.controls.forPassenger.value) {
          this.controls.onlyAdult.setValue(null);
        }
      }
    });
    this.controls.forPassenger.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((checked) => {
      if (checked) {
        this.controls.forTrip.setValue(null);
      } else if (this.controls.forDriver.value) {
        this.controls.onlyAdult.setValue(null);
      }
    });
    this.controls.forTrip.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((checked) => {
      if (checked) {
        this.controls.forPassenger.setValue(null);
        this.controls.forDriver.setValue(null);
      }
    });
  }

  private loadOperators() {
    this.operatorService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          // TODO DELETE
          this.controls.operators.setValue(this.operatorService.entities.map((e: Operator) => e._id));
        },
        (err) => {
          this.operatorService._entities$.next([
            {
              _id: '1',
              nom_commercial: 'Maxicovoit',
              raison_sociale: 'Maxicovoit SAS',
            },
            {
              _id: '2',
              nom_commercial: 'Supercovoit',
              raison_sociale: 'Supercovoit SAS',
            },
            {
              _id: '3',
              nom_commercial: 'Batcovoit',
              raison_sociale: 'Batcovoit SAS',
            },
          ]);
          this.controls.operators.setValue(this.operatorService.entities.map((e: Operator) => e._id));
        },
      );
  }
}
