import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

import { StatCardInterface } from '~/core/interfaces/stat/statCardInterface';
import { StatCard } from '~/core/entities/stat/statCard';

import { statCards } from '../../../../config/statCards';

import { StatService } from '../../../../services/stat.service';

@Component({
  selector: 'app-stat-number',
  templateUrl: './stat-number.component.html',
  styleUrls: ['./stat-number.component.scss'],
})
export class StatNumberComponent implements OnInit {
  public statCard: StatCardInterface | null = null;
  private _statNumberName: string = null;

  @Input()
  set statNumberName(statNumberName: string) {
    this.initStatCard(statNumberName);
    this._statNumberName = statNumberName;
  }
  @Output() linkClicked: EventEmitter<string> = new EventEmitter();

  constructor(private statService: StatService) {}

  ngOnInit() {}

  private initStatCard(statNumberName: string): void {
    console.log(statNumberName);
    console.log(this.statService.stat);
    let title = _.get(this.statService.stat, statCards[statNumberName].path);
    const statCard = statCards[statNumberName];

    if (statCard.unit) {
      title += ` ${statCard.unit}`;
    }

    this.statCard = new StatCard({
      title,
      hint: statCard.hint,
      svgIcon: statCard.svgIcon,
      link: statCard.link,
    });
  }

  public onLinkClick(): void {
    if (this._statNumberName) {
      this.linkClicked.emit(this._statNumberName);
    }
  }
}
