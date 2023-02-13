import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { CommonDataService } from '~/core/services/common-data.service';
import { CompiledPolicyInterface } from '~/shared/policy/common/interfaces/PolicyInterface';
import { CampaignApiService } from '../../services/campaign-api.service';

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
    CampaignStatusEnum.PENDING,
    CampaignStatusEnum.DRAFT,
    CampaignStatusEnum.ENDED,
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

  public filteredCampaigns: CompiledPolicyInterface[];
  public campaignsToShow: CompiledPolicyInterface[];
  public campaigns: CompiledPolicyInterface[];
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
    private campaignApiService: CampaignApiService,
    private fb: FormBuilder,
    private commonDataService: CommonDataService,
  ) {
    super();
  }

  ngOnInit(): void {
    // search field
    this.searchFilters = this.fb.group({ query: [''] });

    merge(
      this.campaignApiService.getList().pipe(
        debounceTime(100),
        map((result: { data: CompiledPolicyInterface[]; meta: any }) =>
          result.data.sort((a, b) => PolicyStatus[a.status] - PolicyStatus[b.status]),
        ),
        tap((campaigns: CompiledPolicyInterface[]) => (this.campaigns = campaigns)),
      ),
      this.searchFilters.valueChanges,
    )
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginator.pageIndex = 0;
        this.campaignsToShow = this.filterCampaignList();
      });

    this.commonDataService.loadTerritories();
  }

  public paginationUpdate(): void {
    this.campaignsToShow = this.filterCampaignList();
  }

  private filterCampaignList(page = this.paginator.pageIndex): CompiledPolicyInterface[] {
    if (!this.campaigns) return [];

    const start = Number(page) * this.PAGE_SIZE;
    const end = Number(page) * this.PAGE_SIZE + this.PAGE_SIZE;
    const query = this.searchFilters?.value?.query ?? '';

    // filter results using search field
    // inject territory name
    this.filteredCampaigns = this.campaigns
      .map((c) => ({ ...c, territory: this.commonDataService.territoryNames[c.territory_id] || null }))
      .filter((c) => {
        return `${c.territory} ${c.description} ${c.name}`.toLowerCase().includes(query.toLowerCase());
      });

    return this.filteredCampaigns.slice(start, end);
  }
}

export enum PolicyStatus {
  active,
  draft,
  finished,
}
