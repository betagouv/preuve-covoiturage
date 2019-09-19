import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import * as moment from 'moment';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { Campaign } from '~/core/entities/campaign/campaign';
import { CampaignNameInterface } from '~/core/interfaces/campaign/campaign-name.interface';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';

@Component({
  selector: 'app-campaign-auto-complete',
  templateUrl: './campaign-auto-complete.component.html',
  styleUrls: ['./campaign-auto-complete.component.scss'],
})
export class CampaignAutoCompleteComponent extends DestroyObservable implements OnInit {
  @Input() parentForm: FormGroup;

  public campaignCtrl = new FormControl();

  public campaigns: CampaignNameInterface[] = [];
  public filteredCampaigns: CampaignNameInterface[];

  @ViewChild('campaignInput', { static: false }) campaignInput: ElementRef;

  constructor(private campaignService: CampaignService) {
    super();
  }

  ngOnInit() {
    this.initCampaigns();
    this.campaignCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((literal) => this.filterCampaigns(literal)))
      .subscribe();
  }

  get campaignIdsControl(): FormControl {
    return <FormControl>this.parentForm.get('campaignIds');
  }

  /**
   * todo: refactor when search is made server side
   */
  getCampaignLabel(campaignId): string {
    return this.campaigns.find((campaign) => campaign._id === campaignId).name;
  }

  public remove(campaignId: string): void {
    const index = this.campaignIdsControl.value.indexOf(campaignId);
    if (index >= 0) {
      const campaigns = [...this.campaignIdsControl.value];
      campaigns.splice(index, 1);
      this.campaignIdsControl.setValue(campaigns);
    }
  }

  public onCampaignSelect(event: MatAutocompleteSelectedEvent): void {
    const campaignIds: string[] = this.campaignIdsControl.value || [];
    campaignIds.push(event.option.value);
    this.campaignIdsControl.setValue(campaignIds);
    this.campaignInput.nativeElement.value = null;
    this.campaignCtrl.setValue(null);
  }

  private initCampaigns() {
    if (!this.campaignService.campaignsLoaded) {
      this.campaignService
        .load()
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }

    this.campaignService.entities$.pipe(takeUntil(this.destroy$)).subscribe((campaigns: Campaign[]) => {
      this.campaigns = campaigns.map((campaign: Campaign) => ({ _id: campaign._id, name: campaign.name }));
      this.filterCampaigns();
    });
  }

  private filterCampaigns(literal: string = ''): void {
    const selectedCampaignIds = this.campaignIdsControl.value || [];
    this.filteredCampaigns = this.campaigns.filter(
      (campaign) => selectedCampaignIds.indexOf(campaign._id) === -1 && campaign.name.toLowerCase().includes(literal),
    );
  }
}
