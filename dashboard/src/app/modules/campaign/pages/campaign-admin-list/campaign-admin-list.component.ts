import { Component, OnInit, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonToggleGroup, MatPaginator } from '@angular/material';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CAMPAIGN_STATUS_FR, CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  templateUrl: './campaign-admin-list.component.html',
  styleUrls: ['./campaign-admin-list.component.scss'],
})
export class CampaignAdminListComponent extends DestroyObservable implements OnInit {
  filteredCampaigns: CampaignUx[];
  campaignsToShow: CampaignUx[];
  campaigns: CampaignUx[];
  searchFilters: FormGroup;
  selectedStatus = CampaignStatusEnum.VALIDATED;
  allStatus = [
    CampaignStatusEnum.DRAFT,
    CampaignStatusEnum.PENDING,
    CampaignStatusEnum.VALIDATED,
    CampaignStatusEnum.ARCHIVED,
  ];
  titles = {
    [CampaignStatusEnum.DRAFT]: 'Les campagnes en brouillon',
    [CampaignStatusEnum.PENDING]: "Les campagnes en cours d'activation",
    [CampaignStatusEnum.VALIDATED]: 'Les campagnes en cours',
    [CampaignStatusEnum.ARCHIVED]: 'Les campagnes terminées',
    [CampaignStatusEnum.TEMPLATE]: 'Les modèles de campagnes',
  };
  PAGE_SIZE = 10;
  @ViewChild(MatButtonToggleGroup, { static: false }) statusToggle: MatButtonToggleGroup;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(
    private _authService: AuthenticationService,
    private _campaignStoreService: CampaignStoreService,
    private fb: FormBuilder,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initSearchForm();
  }

  ngAfterViewInit(): void {
    this.loadCampaigns();
  }

  filterCampaignList(page = this.paginator.pageIndex): CampaignUx[] {
    // const page = this.paginator.pageIndex;
    const start = Number(page) * this.PAGE_SIZE;
    const end = Number(page) * this.PAGE_SIZE + this.PAGE_SIZE;
    const query = this.searchFilters.controls.query.value ? this.searchFilters.controls.query.value : '';
    this.filteredCampaigns = this.campaigns
      .filter(
        (c) =>
          `${c.description} ${c.name}`.toLowerCase().includes(query.toLowerCase()) &&
          (this.selectedStatus.length === 0 || this.selectedStatus.indexOf(c.status) !== -1),
      )
      .sort((a, b) => (a.start.isAfter(b.start) ? -1 : 1));
    return this.filteredCampaigns.slice(start, end);
  }

  private loadCampaigns(): void {
    merge(
      this._campaignStoreService.campaignsUx$.pipe(tap((campaigns: CampaignUx[]) => (this.campaigns = campaigns))),
      this.searchFilters.valueChanges.pipe(debounceTime(300)),
      this.statusToggle.valueChange,
    )
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginator.pageIndex = 0;
        this.campaignsToShow = this.filterCampaignList();
      });

    this._campaignStoreService.loadList();
  }

  paginationUpdate(): void {
    this.campaignsToShow = this.filterCampaignList();
  }

  getFrenchStatus(status: CampaignStatusEnum): string {
    return CAMPAIGN_STATUS_FR[status];
  }

  get countCampaigns(): number {
    return this.filteredCampaigns && this.filteredCampaigns.length;
  }

  get displayData(): boolean {
    return this.campaignsToShow && this.campaignsToShow.length !== 0;
  }

  get noCampaignMessage(): string {
    return this.searchFilters && this.searchFilters.controls.query.value
      ? 'Pas de résultats avec vos critères de recherche'
      : `Aucune campagne ${this.getFrenchStatus(this.selectedStatus).toLowerCase()}.`;
  }

  private initSearchForm(): void {
    this.searchFilters = this.fb.group({
      query: [''],
    });
  }
}
