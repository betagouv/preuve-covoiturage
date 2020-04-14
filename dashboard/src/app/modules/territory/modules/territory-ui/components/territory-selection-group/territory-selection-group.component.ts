import { Component, OnInit, Input } from '@angular/core';
import {
  TerritorySelectionBlock,
  generateRandomTerritoryChildren,
  TerritorySelectionState,
} from '../../data/TerritorySelectionBlock';

@Component({
  selector: 'app-territory-selection-group',
  templateUrl: './territory-selection-group.component.html',
  styleUrls: ['./territory-selection-group.component.scss'],
})
export class TerritorySelectionGroupComponent implements OnInit {
  constructor() {}

  @Input() territory: TerritorySelectionBlock;
  open = false;
  childrenLoadStarted = false;
  TerritorySelectionState = TerritorySelectionState;

  async swap(): Promise<void> {
    this.open = !this.open;
    if (this.open && !this.childrenLoadStarted) {
      this.childrenLoadStarted = true;
      await generateRandomTerritoryChildren(this.territory);
    }
  }

  ngOnInit(): void {}
}
