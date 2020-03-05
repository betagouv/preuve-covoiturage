import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';

import { InseeAndTerritoryInterface } from '~/core/entities/campaign/ux-format/incentive-filters';
import { tripLocationValidator } from '~/modules/campaign/validators/trip-location.validator';

@Component({
  selector: 'app-campaign-insee-filter',
  templateUrl: './campaign-insee-filter.component.html',
  styleUrls: ['./campaign-insee-filter.component.scss'],
})
export class CampaignInseeFilterComponent implements OnInit {
  @Input() inseeForm: FormGroup;
  @Input() filterType: 'whiteList' | 'blackList';

  editingIndex = -1;

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit(): void {}

  startTerritories(index: number): InseeAndTerritoryInterface[] {
    return this.listFormArray.controls[index].get('start').value;
  }

  endTerritories(index: number): InseeAndTerritoryInterface[] {
    return this.listFormArray.controls[index].get('end').value;
  }

  get listFormArray(): FormArray {
    return this.inseeForm.get(this.filterType) as FormArray;
  }

  isEditing(index: number): boolean {
    return this.editingIndex === index;
  }

  addStartEnd(idx: number): void {
    this.editingIndex = -1;
  }

  newStartEnd(): void {
    this.listFormArray.push(this.generateStartEndFormGroup());
    this.editingIndex = this.listFormArray.controls.length - 1;
  }

  removeStartEnd(idx): void {
    this.listFormArray.removeAt(idx);
    if (this.editingIndex !== -1) this.editingIndex -= 1;
  }

  cancel(idx): void {
    this.listFormArray.removeAt(idx);
    this.editingIndex = -1;
  }

  generateStartEndFormGroup(): FormGroup {
    return this._formBuilder.group(
      {
        start: [[]],
        end: [[]],
      },
      { validators: [tripLocationValidator] },
    );
  }
}
