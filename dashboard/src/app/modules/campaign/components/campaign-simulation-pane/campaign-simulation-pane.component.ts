import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CampaignReducedStats } from '~/core/entities/campaign/api-format/CampaignStats';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import * as moment from 'moment';
import { CampaignApiService } from '../../services/campaign-api.service';
import { CampaignFormater } from '~/core/entities/campaign/api-format/campaign.formater';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { takeUntil } from 'rxjs/operators';

interface SimulationDateRange {
  startDate: Date;
  endDate: Date;
  startDateString: string;
  endDateString: string;
  nbMonth: number;
}

function getTimeState(nbMonth): SimulationDateRange {
  const d = new Date();
  const endDate = new Date(d.getFullYear(), d.getMonth(), 0);
  const startDate = new Date(d.getFullYear(), d.getMonth() - nbMonth, 1);

  return {
    nbMonth,
    startDate,
    endDate,
    startDateString: format(startDate, 'd MMMM yyyy', { locale: fr }),
    endDateString: format(endDate, 'd MMMM yyyy', { locale: fr }),
  };
}

@Component({
  selector: 'app-campaign-simulation-pane',
  templateUrl: './campaign-simulation-pane.component.html',
  styleUrls: ['./campaign-simulation-pane.component.scss'],
})
export class CampaignSimulationPaneComponent extends DestroyObservable implements OnInit, OnChanges {
  state: CampaignReducedStats = { trip_excluded: 0, trip_subsidized: 0, amount: 0 };
  timeState = getTimeState(3);
  @Input() campaign: CampaignUx;

  simulatedCampaign: CampaignUx;

  constructor(protected campaignApi: CampaignApiService) {
    super();
  }

  updateCampaign(campaign: CampaignUx = this.campaign) {
    this.simulatedCampaign = new CampaignUx(campaign);
    this.simulatedCampaign.start = moment(this.timeState.startDate);
    this.simulatedCampaign.end = moment(this.timeState.endDate);

    this.campaignApi
      .simulate(CampaignFormater.toApi(this.simulatedCampaign))
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => (this.state = state));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.campaign) {
      this.updateCampaign(changes.campaigns.currentValue);
    }

    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    if (this.campaign) {
      this.updateCampaign();
    }
  }
}
