import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { Territory } from '~/core/entities/territory/territory';

@Component({
  selector: 'app-territory-details',
  templateUrl: './territory-details.component.html',
  styleUrls: ['./territory-details.component.scss'],
})
export class TerritoryDetailsComponent implements OnInit, OnChanges {
  @Input() territory: Territory;
  @Input() displayContacts = true;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['territory']) {
      this.setTerritoryDetails(new Territory(changes['territory'].currentValue));
    }
  }

  private setTerritoryDetails(territory: Territory): void {
    this.territory = territory.clone() as Territory;
  }
}
