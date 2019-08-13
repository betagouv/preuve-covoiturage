import { Component, Input, OnInit } from '@angular/core';

import { statDataNameType } from '~/core/types/stat/statDataNameType';
import { Stat } from '~/core/entities/stat/stat';

import { mockStats } from '../../../../mocks/stats';
import { StatService } from '../../../../services/stat.service';

@Component({
  selector: 'app-stat-graph-view',
  templateUrl: './stat-graph-view.component.html',
  styleUrls: ['./stat-graph-view.component.scss'],
})
export class StatGraphViewComponent implements OnInit {
  @Input() graphName: statDataNameType;

  constructor(public statService: StatService) {}

  ngOnInit() {
    if (!this.statService._loaded$.value) {
      this.statService.load().subscribe(
        () => {},
        (err) => {
          // TODO TMP DELETE WHEN BACK IS LINKED
          const stat = new Stat(mockStats);
          this.statService.formatData(stat);
        },
      );
    }
  }
}
