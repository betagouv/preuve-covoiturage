import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { MatTabGroup } from '@angular/material';

import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { CAMPAIGN_RULES_MAX_DISTANCE_KM } from '~/core/const/campaign/rules.const';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { DialogService } from '~/core/services/dialog.service';
import { CampaignUiService } from '~/modules/campaign/services/campaign-ui.service';
import { dayLabelCapitalized } from '~/core/const/days.const';
import { tripTabValidator } from '~/modules/campaign/validators/trip-tab.validator';

@Component({
  selector: 'app-filters-form',
  templateUrl: './filters-form.component.html',
  styleUrls: ['./filters-form.component.scss', '../campaign-sub-form.scss'],
})
export class FiltersFormComponent extends DestroyObservable implements OnInit, AfterViewInit {
  @Input() campaignForm: FormGroup;
  @Input() isCreating = false;
  @Input() displayOperatorFilter = false;

  tripClassKeys = Object.keys(TripRankEnum);
  maxDistance = CAMPAIGN_RULES_MAX_DISTANCE_KM;
  selectedInseeFilterTabIndex;
  loading = true;

  // delegate method
  dayLabel = dayLabelCapitalized;

  @ViewChild('mtg', { static: false }) inseeFilterTabGroup: MatTabGroup;
  private initValue = 0;

  constructor(
    private _formBuilder: FormBuilder,
    private _dialog: DialogService,
    private _campaignUiService: CampaignUiService,
  ) {
    super();
  }

  get days(): number[] {
    return this._campaignUiService.days;
  }

  ngOnInit(): void {
    this.initTargetChangeDetection();
    // this.initInseeTabChangeDetection();
    this.initAllOperatorChangeDetection();
  }

  initAllOperatorChangeDetection(): void {
    this.filtersForm
      .get('all_operators')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateOperatorsValidator());
    this.updateOperatorsValidator();
  }

  ngAfterViewInit(): void {
    this.initSelectedInseeFilterTabIndex();
  }

  get filtersForm(): FormGroup {
    return this.campaignForm.get('filters') as FormGroup;
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.filtersForm.controls;
  }

  get forDriverControl(): FormControl {
    return this.campaignForm.get('ui_status').get('for_driver') as FormControl;
  }

  get forPassengerControl(): FormControl {
    return this.campaignForm.get('ui_status').get('for_passenger') as FormControl;
  }

  get InseeForm(): FormGroup {
    return this.filtersForm.get('insee') as FormGroup;
  }

  get forTripControl(): FormControl {
    return this.campaignForm.get('ui_status').get('for_trip') as FormControl;
  }

  get timeCtrlArray(): FormArray {
    return this.filtersForm.get('time') as FormArray;
  }

  addTimeFilter(): void {
    this.timeCtrlArray.push(this._formBuilder.control(null, Validators.required));
  }

  removeTimeFilter(idx): void {
    this.timeCtrlArray.removeAt(idx);
  }

  get whiteListFormArray(): FormArray {
    return this.InseeForm.get('whiteList') as FormArray;
  }

  get blackListFormArray(): FormArray {
    return this.InseeForm.get('blackList') as FormArray;
  }

  get hasInseefilter(): boolean {
    return this.hasInseeBlackList || this.hasInseeWhiteList;
  }

  get hasInseeBlackList(): boolean {
    return this.InseeForm.get('blackList').value && this.InseeForm.get('blackList').value.length > 0;
  }

  get hasInseeWhiteList(): boolean {
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

  /*
  public getDaysFrench(day: WeekDay) {
    // return // get string with first letter upper case
    return DAYS[day].charAt(0).toUpperCase() + DAYS[day].slice(1);
  }
  */

  showOperatorsLabel(): string {
    const operators = this.filtersForm.get('operator_ids').value;
    const allOperators = this.filtersForm.get('all_operators').value;
    let label = '';
    if (allOperators) {
      label = 'Tous les opérateurs';
    } else {
      const multipleOperators = operators.length > 1;
      label += `${operators.length} opérateur${multipleOperators ? 's' : ''}
      participant${multipleOperators ? 's' : ''} à la campagne`;
    }
    return label;
  }

  isTimeCtrlArrayTouched(): boolean {
    for (const control of this.timeCtrlArray.controls) {
      if (!control.valid && control.touched) {
        return true;
      }
    }
    return false;
  }

  private initTargetChangeDetection(): void {
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

  private initSelectedInseeFilterTabIndex(): void {
    setTimeout(() => {
      this.inseeFilterTabGroup.selectedIndex = this.selectedInseeFilterTabIndex = this.campaignForm.get('ui_status')
        .value.insee_mode
        ? 1
        : 0;

      this.updateInseeValidator();
    }, 1000);
  }

  updateOperatorsValidator(): void {
    const operatorIdsForm = this.filtersForm.get('operator_ids');
    operatorIdsForm.setValidators(this.filtersForm.get('all_operators').value ? [] : [Validators.required]);
    operatorIdsForm.updateValueAndValidity();
    operatorIdsForm.markAllAsTouched();
  }

  updateInseeValidator(): void {
    const checkForEmptyInsees = this.campaignForm.get('ui_status').value.insee_mode;
    const inseeFG = this.campaignForm.get('filters').get('insee');

    // set validator only if user select "choose autorized trajects"
    inseeFG.setValidators(checkForEmptyInsees ? [tripTabValidator] : []);
    inseeFG.markAllAsTouched();
    inseeFG.updateValueAndValidity();
  }

  selectedInseeFilterTabIndexChange(nextIndex: 0 | 1): void {
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
