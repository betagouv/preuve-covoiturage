import { Component, OnInit } from '@angular/core';

import { TerritoryService } from '~/modules/territory/services/territory.service';
import { Territory } from '~/core/entities/territory/territory';

@Component({
  selector: 'app-territory-list-view',
  templateUrl: './territory-list-view.component.html',
  styleUrls: ['./territory-list-view.component.scss'],
})
export class TerritoryListViewComponent implements OnInit {
  filterLiteral = '';
  showForm = false;
  private territoryToEdit: Territory = null;

  constructor(private _territoryService: TerritoryService) {}

  ngOnInit() {}

  pipeFilter(literal: any) {
    this.filterLiteral = literal;
  }

  pipeEdit(territory: any) {
    this.territoryToEdit = territory;
    // this._territoryService.territoryToEdit = territoryId;
    this.showForm = true;
  }

  close() {
    this.showForm = false;
  }
}
