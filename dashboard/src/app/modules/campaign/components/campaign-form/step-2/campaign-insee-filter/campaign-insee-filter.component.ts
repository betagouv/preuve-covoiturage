import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { InseeAndTerritoryInterface } from '~/core/entities/campaign/ux-format/incentive-filters';

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

  ngOnInit() {}

  startTerritories(index: number): InseeAndTerritoryInterface[] {
    return this.listFormArray.controls[index].get('start').value;
  }

  endTerritories(index: number): InseeAndTerritoryInterface[] {
    return this.listFormArray.controls[index].get('end').value;
  }

  get listFormArray() {
    return <FormArray>this.inseeForm.get(this.filterType);
  }

  isEditing(index: number) {
    return this.editingIndex === index;
  }

  addStartEnd(idx: number) {
    this.editingIndex = -1;
  }

  newStartEnd() {
    this.listFormArray.push(this.generateStartEndFormGroup());
    this.editingIndex = this.listFormArray.controls.length - 1;
  }

  removeStartEnd(idx) {
    this.listFormArray.removeAt(idx);
    if (this.editingIndex !== -1) this.editingIndex -= 1;
  }

  cancel(idx) {
    this.listFormArray.removeAt(idx);
    this.editingIndex = -1;
  }

  generateStartEndFormGroup(): FormGroup {
    return this._formBuilder.group({
      start: [[], Validators.required],
      end: [[], Validators.required],
    });
  }
}
