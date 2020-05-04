import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Territory } from '~/core/entities/territory/territory';
import { TerritorySelectionBlock, IdName } from '../../data/TerritorySelectionBlock';
import { TerritoryAutocompleteComponent } from '../territory-autocomplete/territory-autocomplete.component';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';

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
  territorySelectionFilter = (territory: Territory): boolean => {
    // console.log('territory._id : ', territory._id);
    return this.subIgnoredIds.indexOf(territory._id) === -1;
  };
  protected subIgnoredIds: number[] = [];
  protected subIgnoredIdsGroups: number[][] = [];

  constructor(private fb: FormBuilder, private api: TerritoryApiService) {}

  addTerritory(): void {
    this.api.getDirectRelation(this.selectedTerritory.id).subscribe((relation) => {
      // we add current ,all descendant and all ancestors of currently added territory
      // to ignore list in order to avoid cross / double linking
      const ignoreIds = [...relation.ancestor_ids, ...relation.descendant_ids, relation._id];
      this.subIgnoredIds.push(...ignoreIds);
      // console.log('subIgnoredIds ', this.subIgnoredIds);
      this.territories.push(new TerritorySelectionBlock(this.selectedTerritory));
      this.subIgnoredIdsGroups.push(ignoreIds);

      this.territorySelection.clear();
    });
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
    this.subIgnoredIdsGroups[ind].forEach((id) => this.subIgnoredIds.splice(this.subIgnoredIds.indexOf(id), 1));
    this.subIgnoredIdsGroups.splice(ind, 1);
  }

  ngOnInit(): void {
    this.territoryAddForm = this.fb.group({
      territory_id: [null, [Validators.required]],
    });

    this.territoryAddForm.valueChanges.subscribe((val) => console.log('change', val));
    this.subIgnoredIds = [];
  }

  getFlatSelectedList(list: IdName[] = []): IdName[] {
    for (const territory of this.territories) {
      territory.getFlatSelectedList(list);
    }
    return list;
  }
}
