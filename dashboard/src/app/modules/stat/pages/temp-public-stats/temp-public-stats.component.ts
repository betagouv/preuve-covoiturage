import { Component, OnInit } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';

import { StatNumber } from '~/core/entities/stat/statNumber';
import { URLS } from '~/core/const/main.const';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { StatTmpPublicService } from '~/modules/stat/services/stat-tmp-public.service';
import { statNumbers } from '~/modules/stat/config/statNumbers';

@Component({
  selector: 'app-temp-public-stats',
  templateUrl: './temp-public-stats.component.html',
  styleUrls: ['./temp-public-stats.component.scss'],
})
export class TempPublicStatsComponent extends DestroyObservable implements OnInit {
  statNumbers: StatNumber[] = [];
  gitbookLinkStats = URLS.gitbookLinkStats;

  statNumberNames = ['trips', 'distance', 'co2', 'petrol'];

  constructor(private statTmpPublicService: StatTmpPublicService) {
    super();
  }

  ngOnInit() {
    this.loadStat();
    this.statTmpPublicService.stat$
      .pipe(
        filter((stats) => !!stats),
        takeUntil(this.destroy$),
      )
      .subscribe((stats) => {
        console.log({ stats });
        const statNumbersArray = [];
        for (const statName of this.statNumberNames) {
          const title = stats[statName];
          const statCard = statNumbers[statName];
          statNumbersArray.push(
            new StatNumber({
              title,
              hint: statCard.hint,
              svgIcon: statCard.svgIcon,
              unit: statCard.unit,
            }),
          );
        }
        this.statNumbers = statNumbersArray;
      });
  }

  get loading(): boolean {
    return this.statTmpPublicService.loading;
  }

  get loaded(): boolean {
    return this.statTmpPublicService.loaded;
  }

  private loadStat(): void {
    if (this.statTmpPublicService.loading) {
      return;
    }
    this.statTmpPublicService.loadOne().subscribe();
  }
}
