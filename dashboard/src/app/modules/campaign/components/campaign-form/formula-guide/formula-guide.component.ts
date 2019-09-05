import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { IncentiveFormulaParameterInterface } from '~/core/interfaces/campaign/campaignInterface';
import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-formula-guide',
  templateUrl: './formula-guide.component.html',
  styleUrls: ['./formula-guide.component.scss'],
})
export class FormulaGuideComponent extends DestroyObservable implements OnInit {
  constructor(private campaignService: CampaignService) {
    super();
  }

  ngOnInit() {}

  get parameters(): IncentiveFormulaParameterInterface[] {
    return this.campaignService._parameters$.value;
  }

  get loading(): boolean {
    return this.campaignService.loading && !this.campaignService._parametersLoaded$.value;
  }

  public initParameters() {
    if (!this.campaignService._parametersLoaded$.value) {
      this.campaignService
        .loadFormulaParameters()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
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
