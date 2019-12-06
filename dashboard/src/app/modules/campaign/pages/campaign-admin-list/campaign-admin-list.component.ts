import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CAMPAIGN_STATUS_FR, CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

@Component({
  selector: 'app-campaign-admin-list',
  templateUrl: './campaign-admin-list.component.html',
  styleUrls: ['./campaign-admin-list.component.scss'],
})
export class CampaignAdminListComponent extends DestroyObservable implements OnInit {
  filteredCampaigns: CampaignUx[];
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

  constructor(private _campaignService: CampaignService, private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.initSearchForm();
  }

  ngAfterViewInit() {
    this.loadCampaigns();
  }

  private loadCampaigns(): void {
    merge(
      this._campaignService.campaignsUx$.pipe(
        tap((campaigns: CampaignUx[]) => (this.campaigns = campaigns)),
        takeUntil(this.destroy$),
      ),
      this.searchFilters.valueChanges.pipe(debounceTime(300)),
    )
      .pipe(
        distinctUntilChanged(),
        map(() => {
          const query = this.searchFilters.controls.query.value ? this.searchFilters.controls.query.value : '';
          return this.campaigns.filter((c) => `${c.description} ${c.name}`.toLowerCase().includes(query.toLowerCase()));
        }),
      )
      .subscribe((campaigns) => {
        this.filteredCampaigns = campaigns;
      });
    if (this._campaignService.campaignsLoaded) {
      return;
    }
    this._campaignService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  get loading(): boolean {
    return this._campaignService.loading;
  }

  get loaded(): boolean {
    return this._campaignService.loaded;
  }

  getFrenchStatus(status: CampaignStatusEnum): string {
    return CAMPAIGN_STATUS_FR[status];
  }

  get noCampaignMessage() {
    return this.searchFilters && this.searchFilters.controls.query.value
      ? 'Pas de résultats avec vos critères de recherche'
      : `Aucune campagne ${this.getFrenchStatus(this.selectedStatus).toLowerCase()}.`;
  }

  private initSearchForm() {
    this.searchFilters = this.fb.group({
      query: [''],
    });
  }
}
