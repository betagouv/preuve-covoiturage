import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { filter, takeUntil } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { PolicyInterface } from '~/shared/policy/common/interfaces/PolicyInterface';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { CampaignNameInterface } from '~/core/interfaces/campaign/campaign-name.interface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';

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

  @ViewChild('campaignInput') campaignInput: ElementRef;

  constructor(
    private commonDataService: CommonDataService,
    private auth: AuthenticationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initCampaigns();
    this.campaignCtrl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        filter((val) => val !== null && typeof val !== 'number'),
      )
      .subscribe((literal) => this.filterCampaigns(literal));
  }

  get campaignIdsControl(): FormControl {
    return this.parentForm.get('campaignIds') as FormControl;
  }

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

  private initCampaigns(): void {
    const userTerritoryId = this.auth.user && this.auth.user.territory_id ? this.auth.user.territory_id : null;

    this.commonDataService.campaigns$.pipe(takeUntil(this.destroy$)).subscribe((campaigns: PolicyInterface[]) => {
      this.campaigns = campaigns
        ? campaigns
            .filter(
              (campaign) =>
                ((!userTerritoryId || userTerritoryId === (campaign as PolicyInterface).territory_id) &&
                  campaign.status === CampaignStatusEnum.VALIDATED) ||
                campaign.status === CampaignStatusEnum.ARCHIVED,
            )
            .map((campaign: PolicyInterface) => ({
              _id: campaign._id,
              name: campaign.name,
            }))
        : null;
      if (campaigns) this.filterCampaigns();
    });
  }

  private filterCampaigns(literal = ''): void {
    const selectedCampaignIds = this.campaignIdsControl.value || [];
    this.filteredCampaigns = this.campaigns.filter(
      (campaign) =>
        selectedCampaignIds.indexOf(campaign._id) === -1 &&
        campaign.name.toLowerCase().normalize().includes(literal.toLowerCase().normalize()),
    );
  }
}
