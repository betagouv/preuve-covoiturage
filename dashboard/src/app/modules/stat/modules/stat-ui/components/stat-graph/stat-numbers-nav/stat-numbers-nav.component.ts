import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { StatNumberConfigInterface } from '~/core/interfaces/stat/statNumberInterface';
import { statNavCards, StatNavName } from '~/core/types/stat/statDataNameType';
import { ALL_STATS, statFormater } from '~/modules/stat/config/stat';
import { StatFilteredStoreService } from '~/modules/stat/services/stat-filtered-store.service';

@Component({
  selector: 'app-stat-numbers-nav',
  templateUrl: './stat-numbers-nav.component.html',
  styleUrls: ['./stat-numbers-nav.component.scss'],
})
export class StatNumbersNavComponent extends DestroyObservable implements OnInit, OnChanges {
  @Input() navList: StatNavName[] = ALL_STATS;
  @Input() selectedStat: StatNavName;

  @Output() selectedStatChange = new EventEmitter<StatNavName>();

  statNavCards = statNavCards;
  navCards: StatNumberConfigInterface[];
  totalStatData: StatInterface;

  constructor(private statService: StatFilteredStoreService) {
    super();
  }

  ngOnInit(): void {
    this.statService.totalStats$
      .pipe(
        filter((data) => !!data),
        takeUntil(this.destroy$),
      )
      .subscribe((data) => {
        this.totalStatData = data;
        this.updateCards();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.navList) this.updateCards();
  }

  updateCards(): void {
    if (this.totalStatData) {
      this.navCards = this.navList
        ? this.navList.map((name) => ({
            name,
            title: statFormater[name](this.totalStatData).toString(),
            ...statNavCards[name],
          }))
        : [];
    }
  }

  statClicked(navName: StatNavName) {
    this.selectedStatChange.emit(navName);
  }
}
