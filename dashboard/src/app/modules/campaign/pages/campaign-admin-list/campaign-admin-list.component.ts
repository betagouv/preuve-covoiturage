import { merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';

import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CommonDataService } from '~/core/services/common-data.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { CAMPAIGN_STATUS_FR, CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

@Component({
  selector: 'app-campaign-admin-list',
  templateUrl: './campaign-admin-list.component.html',
  styleUrls: ['./campaign-admin-list.component.scss'],
})
export class CampaignAdminListComponent extends DestroyObservable implements OnInit {
  public readonly PAGE_SIZE = 25;

  // order is reflected in the data table
  public readonly statuses: string[] = [
    CampaignStatusEnum.VALIDATED,
    CampaignStatusEnum.ENDED,
    CampaignStatusEnum.PENDING,
    CampaignStatusEnum.DRAFT,
    CampaignStatusEnum.ARCHIVED,
  ];

  // order must match the 'statuses' array
  public readonly icons: string[] = [
    'play_circle_outline',
    'check_circle',
    'pause_circle_outline',
    'drive_file_rename_outline',
    'archive',
  ];

  public filteredCampaigns: CampaignUx[];
  public campaignsToShow: CampaignUx[];
  public campaigns: CampaignUx[];
  public searchFilters: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  get countCampaigns(): number {
    return this.filteredCampaigns && this.filteredCampaigns.length;
  }

  get displayData(): boolean {
    return this.campaignsToShow && this.campaignsToShow.length !== 0;
  }

  get noCampaignMessage(): string {
    return this.searchFilters && this.searchFilters.controls.query.value
      ? 'Pas de résultats avec vos critères de recherche.'
      : "Vous n'avez pas de campagnes.";
  }

  constructor(
    private campaignStoreService: CampaignStoreService,
    private fb: FormBuilder,
    private commonDataService: CommonDataService,
  ) {
    super();
  }

  ngOnInit(): void {
    // search field
    this.searchFilters = this.fb.group({ query: [''] });

    // API call
    merge(
      this.campaignStoreService.campaignsUx$.pipe(
        debounceTime(100),
        map((list: CampaignUx[]): CampaignUx[] => {
          let _ia: number, _ib: number;
          return list
            .filter((item) => this.statuses.indexOf(item.status) > -1)
            .map((item: CampaignUx): CampaignUx => ({ ...item, status: this.extendStatus(item) }))
            .map((item: CampaignUx): CampaignUx & { status_icon: string; status_locale: string } => ({
              status_icon: this.icons[this.statuses.indexOf(item.status)],
              status_locale: CAMPAIGN_STATUS_FR[item.status],
              ...item,
            }))
            .sort((a, b) => {
              _ia = this.statuses.indexOf(a.status);
              _ib = this.statuses.indexOf(b.status);
              return _ia > _ib ? 1 : _ia < _ib ? -1 : 0;
            });
        }),
        tap((campaigns: CampaignUx[]) => (this.campaigns = campaigns)),
      ),
      this.searchFilters.valueChanges,
    )
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginator.pageIndex = 0;
        this.campaignsToShow = this.filterCampaignList();
      });

    // load data
    this.commonDataService.loadTerritories();
    this.campaignStoreService.loadList();
  }

  public paginationUpdate(): void {
    this.campaignsToShow = this.filterCampaignList();
  }

  private filterCampaignList(page = this.paginator.pageIndex): CampaignUx[] {
    if (!this.campaigns) return [];

    const start = Number(page) * this.PAGE_SIZE;
    const end = Number(page) * this.PAGE_SIZE + this.PAGE_SIZE;
    const query = this.searchFilters?.value?.query ?? '';

    // filter results using search field
    // inject territory name
    this.filteredCampaigns = this.campaigns
      .map((c) => ({ ...c, territory: this.commonDataService.territoryNames[c._id] || null }))
      .filter((c) => {
        return `${c.territory} ${c.description} ${c.name}`.toLowerCase().includes(query.toLowerCase());
      });

    return this.filteredCampaigns.slice(start, end);
  }

  private extendStatus(c: CampaignUx): CampaignStatusEnum {
    const isEnded = c.end.toDate().getTime() < new Date().getTime();
    return c.status === CampaignStatusEnum.VALIDATED && isEnded ? CampaignStatusEnum.ENDED : c.status;
  }
}
