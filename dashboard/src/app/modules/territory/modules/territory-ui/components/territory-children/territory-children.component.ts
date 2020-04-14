import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Territory } from '~/core/entities/territory/territory';
import { TerritorySelectionBlock, IdName } from '../../data/TerritorySelectionBlock';
import { TerritoryAutocompleteComponent } from '../territory-autocomplete/territory-autocomplete.component';

@Component({
  selector: 'app-territory-children',
  templateUrl: './territory-children.component.html',
  styleUrls: ['./territory-children.component.scss'],
})
export class TerritoryChildrenComponent implements OnInit {
  @ViewChild('territorySelection', { static: true }) territorySelection: TerritoryAutocompleteComponent;

  public territoryAddForm: FormGroup;

  public territories: TerritorySelectionBlock[] = [];
  selectedTerritory: IdName;
  territorySelectionFilter = (territory: Territory) =>
    this.territories.find((selectedTerritory) => {
      // console.log(selectedTerritory.id, ' === ', territory._id);
      return selectedTerritory.id === territory._id;
    }) === undefined;

  constructor(private fb: FormBuilder) {}

  addTerritory(): void {
    this.territories.push(new TerritorySelectionBlock(this.selectedTerritory));
    this.territorySelection.clear();
  }

  territorySelected(territory: IdName): void {
    this.selectedTerritory = territory ? { id: territory.id, name: territory.name } : null;
    // console.log('this.selectedTerritory : ', this.selectedTerritory);
  }

  removeTerritory(territory: TerritorySelectionBlock): void {
    const ind = this.territories.indexOf(territory);
    if (ind === -1) {
      throw new Error("Try to remove a territory that doesn't exist");
    }

    this.territories.splice(ind, 1);
  }

  ngOnInit(): void {
    this.territoryAddForm = this.fb.group({
      territory_id: [null, [Validators.required]],
    });

    this.territoryAddForm.valueChanges.subscribe((val) => console.log('change', val));
  }
}
