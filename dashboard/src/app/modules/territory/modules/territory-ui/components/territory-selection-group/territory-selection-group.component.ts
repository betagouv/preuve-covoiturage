import { Component, OnInit, Input } from '@angular/core';
import { TerritorySelectionBlock, TerritorySelectionState } from '../../data/TerritorySelectionBlock';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';

@Component({
  selector: 'app-territory-selection-group',
  templateUrl: './territory-selection-group.component.html',
  styleUrls: ['./territory-selection-group.component.scss'],
})
export class TerritorySelectionGroupComponent implements OnInit {
  constructor(private territoryApi: TerritoryApiService) {}

  @Input() territory: TerritorySelectionBlock;
  open = false;
  childrenLoadStarted = false;
  TerritorySelectionState = TerritorySelectionState;

  swap(): void {
    this.open = !this.open;
    if (this.open && !this.childrenLoadStarted && !this.territory.children) {
      this.childrenLoadStarted = true;

      this.territoryApi.getDirectRelation(this.territory.id).subscribe((relations) => {
        const relation = relations[0];
        const children = new Array(relation.children.length);
        for (let i = 0; i < children.length; i++) {
          const child = { id: relation.children[i]._id, name: relation.children[i].name };
          children[i] = child;
        }
        this.territory.setChildren(children);
      });

      // await generateRandomTerritoryChildren(this.territory);
    }
  }

  ngOnInit(): void {}
}
