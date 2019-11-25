import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { Territory } from '~/core/entities/territory/territory';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';
import { TerritoryApiService } from '~/modules/territory/services/territoryApi.service';

@Component({
  selector: 'app-territory-autocomplete',
  templateUrl: './territory-autocomplete.component.html',
  styleUrls: ['./territory-autocomplete.component.scss'],
})
export class TerritoryAutocompleteComponent extends DestroyObservable implements OnInit {
  @Input() parentForm: FormGroup;

  territoryCtrl = new FormControl();
  selectedTerritory: Territory;
  selectedTerritoryId: number;

  public territories: Territory[] = [];

  public filteredTerritories: Observable<Territory[]>;

  private _territoryForm: AbstractControl;

  private focusDebounceTimer;

  constructor(private territoryApiService: TerritoryApiService, private commonDataService: CommonDataService) {
    super();
  }

  updateTerritory(territoryId: number) {}

  private selectedTerritoryUpdated(id = this._territoryForm.value ? this._territoryForm.value : null) {
    this.selectedTerritoryId = id;
    this.selectedTerritory = this.territories
      ? this.territories.find((territory) => this.selectedTerritoryId === territory._id)
      : null;
    this.territoryCtrl.setValue(this.selectedTerritory ? this.selectedTerritory.name : '');

    const val = this.parentForm.getRawValue();
    const newVal = this.selectedTerritory ? this.selectedTerritory._id : null;

    console.log('val : ', val);
    if (!val || val.territory_id !== newVal) {
      this.parentForm.patchValue({ territory_id: newVal });
    }
    // this.parentForm.patchValue({ territory: this.selectedTerritory ? this.selectedTerritory._id : null });
  }

  onTerritorySelect(territory: MatAutocompleteSelectedEvent) {
    clearTimeout(this.focusDebounceTimer);
    this.selectedTerritoryUpdated(territory.option.value);
  }

  ngOnInit() {
    this.commonDataService.territories$.pipe(takeUntil(this.destroy$)).subscribe((territories) => {
      this.territories = territories ? territories : null;
    });

    this.filteredTerritories = this.territoryCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value)),
    );

    this._territoryForm = this.parentForm.get('territory_id');
    this._territoryForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.selectedTerritoryUpdated());

    this.selectedTerritoryUpdated();
  }

  private filter(value: string): Territory[] {
    if (!value || typeof value !== 'string') return this.territories;

    return this.territories
      ? this.territories.filter((territory) => territory.name.toLowerCase().includes(value.toLowerCase()))
      : null;
  }

  inputLostFocus() {
    clearTimeout(this.focusDebounceTimer);
    this.focusDebounceTimer = setTimeout(() => {
      this.territoryCtrl.setValue(this.selectedTerritory ? this.selectedTerritory.name : '');
    }, 300);
  }
}
