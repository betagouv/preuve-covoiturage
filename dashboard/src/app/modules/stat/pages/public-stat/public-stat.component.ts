import { Component, OnInit } from '@angular/core';

import { GraphNamesInterface } from '~/core/interfaces/stat/graphNamesInterface';
import { StatNumber } from '~/core/entities/stat/statNumber';
import { statNumbers } from '~/modules/stat/config/statNumbers';
import { URLS } from '~/core/const/main.const';

@Component({
  selector: 'app-public-stat',
  templateUrl: './public-stat.component.html',
  styleUrls: ['./public-stat.component.scss'],
})
export class PublicStatComponent implements OnInit {
  // todo: connect this to database !
  statValues: GraphNamesInterface = {
    co2: 788162,
    petrol: 257062,
    trips: 271847,
    distance: 4041860,
    carpoolers: 543733,
    carpoolersPerVehicule: 543733 / 271847,
  };

  statNumbers: StatNumber[] = [];
  gitbookLinkStats = URLS.gitbookLinkStats;

  constructor() {}

  ngOnInit() {
    for (const statName of Object.keys(this.statValues)) {
      const statCard = statNumbers[statName];
      this.statNumbers.push(
        new StatNumber({
          title: this.statValues[statName],
          hint: statCard.hint,
          svgIcon: statCard.svgIcon,
          unit: statCard.unit,
        }),
      );
    }
  }
}
