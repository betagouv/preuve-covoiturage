import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { map, startWith, takeUntil } from 'rxjs/operators';

import { Territory } from '~/core/entities/territory/territory';
import { TerritoryService } from '~/modules/territory/services/territory.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';

@Component({
  selector: 'app-territory-autocomplete',
  templateUrl: './territory-autocomplete.component.html',
  styleUrls: ['./territory-autocomplete.component.scss'],
})
export class TerritoryAutocompleteComponent extends DestroyObservable implements OnInit {
  private _searchUpdate: boolean;

  @Input() parentForm: FormGroup;

  territoryCtrl = new FormControl();
  selectedTerritory: Territory;
  selectedTerritoryId: string;

  public territories: Territory[] = [];

  public filteredTerritories: Observable<Territory[]>;

  private _territoryForm: AbstractControl;

  constructor(private territoryService: TerritoryService, private commonDataService: CommonDataService) {
    super();
  }

  updateTerritory(territoryId: string) {}

  private selectedTerritoryUpdated() {
    // console.log('> selectedTerritoryUpdated', this._territoryForm.value);
    this.selectedTerritoryId = this._territoryForm.value ? this._territoryForm.value.toString() : null;
    this.selectedTerritory = this.territories
      ? this.territories.find((territory) => this.selectedTerritoryId === territory._id)
      : null;
    this.territoryCtrl.setValue(this.selectedTerritory ? this.selectedTerritory.name : '');
  }

  onTerritorySelect(territory: MatAutocompleteSelectedEvent) {
    console.log('territory : ', territory.option.value);
    this._territoryForm.setValue(territory.option.value);
    this._searchUpdate = false;
  }

  ngOnInit() {
    this.commonDataService.territories$.pipe(takeUntil(this.destroy$)).subscribe((territories) => {
      this.territories = territories ? territories : null;
    });

    this.filteredTerritories = this.territoryCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter(value)),
    );

    this._territoryForm = this.parentForm.get('territory');
    this._territoryForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.selectedTerritoryUpdated());

    this.selectedTerritoryUpdated();
  }

  // private filterTerritories(territories: Opera[] = []) {
  //   return this.filteredTerritories.filter((territory) => territory.)
  // }
  private filter(value: string): Territory[] {
    this._searchUpdate = true;
    console.log('value : ', value);
    return this.territories
      ? this.territories.filter((territory) => territory.name.toLowerCase().includes(value.toLowerCase()))
      : null;
  }

  inputLostFocus() {
    console.log('this._searchUpdate : ', this._searchUpdate);
    // if search field has been not been updated and input lost focus it restore original value.
    setTimeout(() => {
      if (this._searchUpdate) {
        this.territoryCtrl.setValue(this.selectedTerritory ? this.selectedTerritory.name : '');
      }
    }, 100);
  }
}
