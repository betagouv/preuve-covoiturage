import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { Territory } from '~/core/entities/territory/territory';
import { Operator } from '~/core/entities/operator/operator';

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
      console.log(changes['territory'].currentValue);

      this.setTerritoryDetails(new Territory(changes['territory'].currentValue));
    }
  }

  private setTerritoryDetails(territory: Territory): void {
    this.territory = territory.toFormValues() as Territory;
  }
}
