import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { MatStepper } from '@angular/material';

import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { Campaign } from '~/core/entities/campaign/campaign';
import { IncentiveRules } from '~/core/entities/campaign/incentive-rules';
import { CampaignInterface } from '~/core/interfaces/campaign/campaignInterface';

@Component({
  selector: 'app-policy-form',
  templateUrl: './policy-form.component.html',
  styleUrls: ['./policy-form.component.scss'],
})
export class PolicyFormComponent implements OnInit {
  @Input() control: FormControl;
  @Input() matStepper: MatStepper;
  templates: CampaignInterface[];

  constructor(public campaignService: CampaignService, private toastr: ToastrService) {}

  ngOnInit() {
    this.loadCampaignTemplates();
  }

  public onTemplateCardClick(template: CampaignInterface | null) {
    if (template === null) {
      this.control.setValue(new Campaign());
      this.matStepper.next();
    } else {
      this.control.setValue(template);
    }
  }

  private loadCampaignTemplates() {
    this.campaignService.loadTemplates().subscribe(
      (templates) => {
        this.templates = templates;
      },
      (err) => {
        this.toastr.error(err.message);

        // TODO TMP TO DELETE
        this.templates = [];
        this.templates.push(<Campaign>{
          _id: '1',
          name: 'Encourager le covoiturage',
          description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
          rules: <IncentiveRules>{
            weekday: [0, 1, 2, 3, 4, 5, 6],
            time: [{ start: '08:00', end: '19:00' }],
            range: { min: 0, max: 100 },
            ranks: ['A', 'B'],
            onlyAdult: false,
            forDriver: true,
            forPassenger: true,
          },
        });
        this.templates.push(<Campaign>{
          _id: '2',
          name: 'Limiter le trafic en semaine',
          description: 'Fusce vehicula dolor arcu, sit amet blandit dolor mollis.',
          rules: <IncentiveRules>{
            weekday: [0, 1, 2, 3, 4],
            time: [{ start: '06:00', end: '09:00' }, { start: '16:00', end: '19:00' }],
            range: { min: 0, max: 15 },
            ranks: ['A', 'B', 'C'],
            onlyAdult: false,
            forDriver: true,
            forPassenger: true,
          },
        });
        this.templates.push(<Campaign>{
          _id: '3',
          name: 'Limiter la pollution',
          description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
        });
        this.templates.push(<Campaign>{
          _id: '4',
          name: 'Limiter les embouteillages du week-end',
          description: 'Nam porttitor blandit accumsan. Ut vel dictum sem, a preti.',
        });
        this.templates.push(<Campaign>{
          _id: '5',
          name: 'Limiter le trafic lors d’un évènement ponctuel',
          description: 'Curabitur lobortis id lorem id bibendum. Ut id consectetur.',
        });
      },
    );
  }
}
