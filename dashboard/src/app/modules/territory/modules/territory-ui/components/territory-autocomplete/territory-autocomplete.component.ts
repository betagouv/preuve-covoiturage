import { Component, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { Territory } from '~/core/entities/territory/territory';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';

@Component({
  selector: 'app-territory-autocomplete',
  templateUrl: './territory-autocomplete.component.html',
  styleUrls: ['./territory-autocomplete.component.scss'],
})
export class TerritoryAutocompleteComponent extends DestroyObservable implements OnInit {
  @Input() parentForm: FormGroup;
  @Input() territoryFilter: (territory: Territory) => boolean;
  @Output() selected: Subject<{ id: number; name: string }> = new Subject();

  territoryCtrl = new FormControl();
  selectedTerritory: Territory;
  selectedTerritoryId: number;

  public territories: Territory[] = [];

  public filteredTerritories: Observable<Territory[]>;

  private _territoryForm: AbstractControl;

  private focusDebounceTimer;
  searchText: string;

  constructor(private territoryApiService: TerritoryApiService, private commonDataService: CommonDataService) {
    super();
  }

  updateTerritory(territoryId: number): void {}

  private selectedTerritoryUpdated(id = this._territoryForm.value ? this._territoryForm.value : null): void {
    this.selectedTerritoryId = id;
    this.selectedTerritory = this.territories
      ? this.territories.find((territory) => this.selectedTerritoryId === territory._id)
      : null;
    this.territoryCtrl.setValue(this.selectedTerritory ? this.selectedTerritory.name : '');

    const val = this.parentForm.getRawValue();
    const newVal = this.selectedTerritory ? this.selectedTerritory._id : null;

    if (!val || val.territory_id !== newVal) {
      this.parentForm.patchValue({ territory_id: newVal });
      this.selected.next({ id: this.selectedTerritory._id, name: this.selectedTerritory.name });
    }
    // this.parentForm.patchValue({ territory: this.selectedTerritory ? this.selectedTerritory._id : null });
  }

  clear(): void {
    this.parentForm.patchValue({ territory_id: null });
    this.selectedTerritory = null;
    this.selected.next(null);
  }

  onTerritorySelect(territory: MatAutocompleteSelectedEvent): void {
    clearTimeout(this.focusDebounceTimer);
    this.selectedTerritoryUpdated(territory.option.value);
  }

  ngOnInit(): void {
    this.commonDataService.territories$.pipe(takeUntil(this.destroy$)).subscribe((territories) => {
      this.territories = territories ? territories : [];
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
    // apply optionnal input filter
    const territories = this.territoryFilter ? this.territories.filter(this.territoryFilter) : this.territories;

    if (!value || typeof value !== 'string') return territories.slice(0, 20);

    return this.territories
      ? territories.filter((territory) => territory.name.toLowerCase().includes(value.toLowerCase())).slice(0, 20)
      : null;
  }

  inputLostFocus(): void {
    clearTimeout(this.focusDebounceTimer);
    this.focusDebounceTimer = setTimeout(() => {
      this.territoryCtrl.setValue(this.selectedTerritory ? this.selectedTerritory.name : '');
    }, 300);
  }
}
