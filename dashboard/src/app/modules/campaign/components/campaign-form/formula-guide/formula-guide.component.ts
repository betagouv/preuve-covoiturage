import { Component, OnInit } from '@angular/core';

import { IncentiveFormulaParameterInterface } from '~/core/interfaces/campaign/campaignInterface';
import { CampaignService } from '~/modules/campaign/services/campaign.service';

@Component({
  selector: 'app-formula-guide',
  templateUrl: './formula-guide.component.html',
  styleUrls: ['./formula-guide.component.scss'],
})
export class FormulaGuideComponent implements OnInit {
  constructor(private campaignService: CampaignService) {}

  ngOnInit() {}

  get parameters(): IncentiveFormulaParameterInterface[] {
    return this.campaignService._parameters$.value;
  }

  get loading(): boolean {
    return this.campaignService.loading && !this.campaignService._paramatersLoaded$.value;
  }

  public initParameters() {
    if (!this.campaignService._paramatersLoaded$.value) {
      this.campaignService.loadFormulaParameters().subscribe(
        () => {
          //
        },
        () => {
          this.campaignService._parameters$.next([
            {
              _id: null,
              varname: 'pour_conducteur',
              internal: true,
              helper: 'Incitation pour le conducteur',
            },
            {
              _id: null,
              varname: 'distance',
              internal: true,
              helper: 'Distance en mètre',
            },
            {
              _id: null,
              varname: 'somme_incitations_passager',
              internal: false,
              helper: 'Sommes des incitations de tous les passagers',
            },
            {
              _id: null,
              varname: 'incitation',
              internal: true,
              helper: 'Incitation calculé précédemment de la personne',
            },
          ]);
        },
      );
    }
  }

  // get parameters
}
