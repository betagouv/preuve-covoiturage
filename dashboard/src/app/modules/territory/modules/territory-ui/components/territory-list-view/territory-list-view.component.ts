import { Component, OnInit } from '@angular/core';

import { TerritoryService } from '~/modules/territory/services/territory.service';

@Component({
  selector: 'app-territory-list-view',
  templateUrl: './territory-list-view.component.html',
  styleUrls: ['./territory-list-view.component.scss'],
})
export class TerritoryListViewComponent implements OnInit {
  filterLiteral = '';
  showForm = false;

  constructor(private _territoryService: TerritoryService) {}

  ngOnInit() {}

  pipeFilter(literal: string) {
    this.filterLiteral = literal;
  }

  pipeEdit(territoryId: string) {
    console.log({ territoryId });
    this._territoryService.territoryToEdit = territoryId;
    this.showForm = true;
  }

  close() {
    this.showForm = false;
  }
}
