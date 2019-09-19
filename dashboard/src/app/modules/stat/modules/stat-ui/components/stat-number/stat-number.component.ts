import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';

import { StatNumberInterface } from '~/core/interfaces/stat/statNumberInterface';
import { StatNumber } from '~/core/entities/stat/statNumber';
import { DestroyObservable } from '~/core/components/destroy-observable';

import { statNumbers } from '../../../../config/statNumbers';
import { StatService } from '../../../../services/stat.service';

@Component({
  selector: 'app-stat-number',
  templateUrl: './stat-number.component.html',
  styleUrls: ['./stat-number.component.scss'],
})
export class StatNumberComponent extends DestroyObservable implements OnInit {
  public statNumber: StatNumberInterface | null = null;
  public _selected = false;
  public _disabled = false;

  @Input() statNumberName;
  @Input()
  set selected(selected: boolean) {
    this._selected = selected;
  }
  @Input()
  set disabled(disabled: boolean) {
    this._disabled = disabled;
  }

  @Output() linkClicked: EventEmitter<string> = new EventEmitter();

  constructor(private statService: StatService) {
    super();
  }

  ngOnInit() {
    this.statService.stat$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.initStatNumber(this.statNumberName);
    });
  }

  private initStatNumber(statNumberName: string): void {
    let title = _.get(this.statService.stat, statNumbers[statNumberName].path);
    const statCard = statNumbers[statNumberName];

    if (statCard.unit) {
      title += ` ${statCard.unit}`;
    }

    this.statNumber = new StatNumber({
      title,
      hint: statCard.hint,
      svgIcon: statCard.svgIcon,
      link: statCard.link,
    });
  }

  public onLinkClick(): void {
    this.linkClicked.emit(this.statNumberName);
  }
}
