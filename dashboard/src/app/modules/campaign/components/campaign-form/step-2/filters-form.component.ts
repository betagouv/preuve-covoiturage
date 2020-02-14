import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator, MatTabChangeEvent, MatTabGroup, MatTabLabel } from '@angular/material';
import { WeekDay } from '@angular/common';
import * as moment from 'moment';

import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { CAMPAIGN_RULES_MAX_DISTANCE_KM } from '~/core/const/campaign/rules.const';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { DialogService } from '~/core/services/dialog.service';
import { CampaignUiService } from '~/modules/campaign/services/campaign-ui.service';
import { DAYS } from '~/core/const/days.const';
import { tripTabValidator } from '~/modules/campaign/validators/trip-tab.validator';

@Component({
  selector: 'app-filters-form',
  templateUrl: './filters-form.component.html',
  styleUrls: ['./filters-form.component.scss', '../campaign-sub-form.scss'],
})
export class FiltersFormComponent extends DestroyObservable implements OnInit, AfterViewInit {
  @Input() campaignForm: FormGroup;
  @Input() isCreating = false;

  tripClassKeys = Object.keys(TripRankEnum);
  maxDistance = CAMPAIGN_RULES_MAX_DISTANCE_KM;
  selectedInseeFilterTabIndex;
  loading = true;

  public days: WeekDay[] = [1, 2, 3, 4, 5, 6, 0];

  @ViewChild('mtg', { static: false }) inseeFilterTabGroup: MatTabGroup;
  private initValue = 0;

  constructor(
    private _formBuilder: FormBuilder,
    private _dialog: DialogService,
    private _campaignUiService: CampaignUiService,
  ) {
    super();
  }

  ngOnInit() {
    this.initTargetChangeDetection();
    // this.initInseeTabChangeDetection();
  }

  ngAfterViewInit() {
    this.initSelectedInseeFilterTabIndex();
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

  get InseeForm(): FormGroup {
    return <FormGroup>this.filtersForm.get('insee');
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

  get whiteListFormArray(): FormArray {
    return <FormArray>this.InseeForm.get('whiteList');
  }

  get blackListFormArray(): FormArray {
    return <FormArray>this.InseeForm.get('blackList');
  }

  get hasInseefilter() {
    return this.hasInseeBlackList || this.hasInseeWhiteList;
  }

  get hasInseeBlackList() {
    return this.InseeForm.get('blackList').value && this.InseeForm.get('blackList').value.length > 0;
  }

  get hasInseeWhiteList() {
    return this.InseeForm.get('whiteList').value && this.InseeForm.get('whiteList').value.length > 0;
  }

  get showDateLabel(): string {
    const weekDays = this.filtersForm.get('weekday').value;
    const timeRanges = this.timeCtrlArray.value;
    if (!weekDays) {
      return '';
    }
    return this._campaignUiService.daysAndTimes(weekDays, timeRanges);
  }

  get showDistanceLabel(): string {
    const range = this.filtersForm.get('distance_range').value;
    if (!range) {
      return '';
    }
    return this._campaignUiService.distance(range);
  }

  get showTripClassLabel(): string {
    const rank = this.filtersForm.get('rank').value;
    if (!rank) {
      return '';
    }
    return this._campaignUiService.ranks(rank);
  }

  get showTargetLabel(): string {
    const forDriver = this.forDriverControl.value;
    const forPassenger = this.forPassengerControl.value;
    const forTrip = this.forTripControl.value;
    const onlyAdult = this.campaignForm.get('only_adult').value;

    return this._campaignUiService.targets(forDriver, forPassenger, forTrip, onlyAdult);
  }

  public getDaysFrench(day: WeekDay) {
    return DAYS[day];
  }

  showOperatorsLabel(): string {
    const operators = this.filtersForm.get('operator_ids').value;
    let label = '';
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

  private initSelectedInseeFilterTabIndex() {
    setTimeout(() => {
      this.inseeFilterTabGroup.selectedIndex = this.selectedInseeFilterTabIndex = this.campaignForm.get('ui_status')
        .value.insee_mode
        ? 1
        : 0;

      this.updateInseeValidator();
    }, 1000);
  }

  updateInseeValidator() {
    // Apply rule : At least one trip has to be defined if user select "choose autorized trajects"

    const checkForEmptyInsees = this.campaignForm.get('ui_status').value.insee_mode;
    const inseeFG = this.campaignForm.get('filters').get('insee');

    // set validator only if user select "choose autorized trajects"
    inseeFG.setValidators(checkForEmptyInsees ? [tripTabValidator] : []);
    inseeFG.markAllAsTouched();
    inseeFG.updateValueAndValidity();
  }

  selectedInseeFilterTabIndexChange(nextIndex: 0 | 1) {
    if (nextIndex === this.selectedInseeFilterTabIndex) return;
    if ((nextIndex === 0 && this.hasInseeWhiteList) || (nextIndex === 1 && this.hasInseeBlackList)) {
      this.inseeFilterTabGroup.selectedIndex = nextIndex === 1 ? 0 : 1;
      const title = 'Changement de type de filtre';
      const message = 'Attention, les données seront supprimées.';
      this._dialog
        .confirm({
          title,
          message,
          confirmBtn: 'Confirmer',
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          if (result) {
            this.whiteListFormArray.clear();
            this.blackListFormArray.clear();
            this.inseeFilterTabGroup.selectedIndex = nextIndex;
            this.selectedInseeFilterTabIndex = nextIndex;
            this.campaignForm.get('ui_status').patchValue({ insee_mode: nextIndex === 1 });
          }

          this.updateInseeValidator();
        });
    } else {
      this.selectedInseeFilterTabIndex = nextIndex;
      this.campaignForm.get('ui_status').patchValue({ insee_mode: nextIndex === 1 });
      this.updateInseeValidator();
    }
  }
}
