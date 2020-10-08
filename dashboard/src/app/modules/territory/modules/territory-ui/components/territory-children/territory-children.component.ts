import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Territory } from '~/core/entities/territory/territory';
import { TerritorySelectionBlock, IdName, TerritorySelectionUIState } from '../../data/TerritorySelectionBlock';
import { TerritoryAutocompleteComponent } from '../territory-autocomplete/territory-autocomplete.component';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { UiStatusRelationDetails } from '../../../../../../../../../shared/territory/relationUiStatus.contract';

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
    return this.subIgnoredIds.indexOf(territory._id) === -1;
  };
  protected subIgnoredIds: number[] = [];
  protected subIgnoredIdsGroups: number[][] = [];

  constructor(private fb: FormBuilder, private api: TerritoryApiService) {}

  @Output() hasTerritories = new EventEmitter<boolean>();

  setRelations(ui: UiStatusRelationDetails[] = []): void {
    this.territories = [];
    for (const uiRelation of ui) {
      this.territories.push(TerritorySelectionBlock.fromUiRelation(uiRelation));
    }
    this.territoriesUpdated();
  }

  territoriesUpdated(): void {
    this.hasTerritories.emit(this.territories.length > 0);
  }

  addTerritory(): void {
    this.api.getDirectRelation(this.selectedTerritory.id).subscribe((relations) => {
      // we add current ,all descendant and all ancestors of currently added territory
      // to ignore list in order to avoid cross / double linking

      const relation = relations[0];

      const ignoreIds = [relation._id];
      if (relation.ancestor_ids) ignoreIds.push(...relation.ancestor_ids);
      if (relation.descendant_ids) ignoreIds.push(...relation.descendant_ids);

      this.subIgnoredIds.push(...ignoreIds);
      this.territories.push(new TerritorySelectionBlock(this.selectedTerritory));
      this.subIgnoredIdsGroups.push(ignoreIds);

      this.territorySelection.clear();

      this.territoriesUpdated();
    });
  }

  territorySelected(territory: IdName): void {
    this.selectedTerritory = territory ? { id: territory.id, name: territory.name } : null;
  }

  removeTerritory(territory: TerritorySelectionBlock): void {
    const ind = this.territories.indexOf(territory);
    if (ind === -1) {
      throw new Error("Try to remove a territory that doesn't exist");
    }

    this.territories.splice(ind, 1);
    this.subIgnoredIdsGroups[ind].forEach((id) => this.subIgnoredIds.splice(this.subIgnoredIds.indexOf(id), 1));
    this.subIgnoredIdsGroups.splice(ind, 1);

    this.territoriesUpdated();
  }

  ngOnInit(): void {
    this.territoryAddForm = this.fb.group({
      territory_id: [null, [Validators.required]],
    });

    this.subIgnoredIds = [];
  }

  getFlatSelectedList(list: IdName[] = []): number[] {
    for (const territory of this.territories) {
      territory.getFlatSelectedList(list);
    }
    return list.map((idname: IdName) => idname.id);
  }

  getUISelectionState(): TerritorySelectionUIState[] {
    const res = [];
    for (const territory of this.territories) {
      res.push(territory.getSelectionUIState());
    }
    return res;
  }
}
