import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material';

import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { Campaign } from '~/core/entities/campaign/campaign';
import { IncentiveRules } from '~/core/entities/campaign/incentive-rules';
import { CampaignInterface, CreateCampaignInterface } from '~/core/interfaces/campaign/campaignInterface';
import { CampaignStatus } from '~/core/entities/campaign/campaign-status';
import { IncentiveUnit } from '~/core/entities/campaign/IncentiveUnit';
import { TripClassEnum } from '~/core/enums/trip/trip-class.enum';

@Component({
  selector: 'app-campaign-templates',
  templateUrl: './campaign-templates.html',
  styleUrls: ['./campaign-templates.component.scss'],
})
export class CampaignTemplatesComponent implements OnInit {
  @Input() campaignForm: FormGroup;
  @Input() matStepper: MatStepper;
  @Output() setTemplate = new EventEmitter();
  templates: CreateCampaignInterface[];

  constructor(public campaignService: CampaignService, private toastr: ToastrService) {}

  ngOnInit() {
    this.loadCampaignTemplates();
  }

  public get templateId(): string | null {
    return this.campaignForm.controls.template_id.value;
  }

  public onTemplateCardClick(templateId: string | null) {
    this.matStepper.next();
    this.setTemplate.emit(templateId);
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
        this.templates.push(<CreateCampaignInterface>{
          template_id: '5d6930724f56e6e1d0654542',
          status: 'template',
          name: 'Encourager le covoiturage',
          description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
          rules: <IncentiveRules>{
            weekday: [0, 1, 2, 3, 4, 5, 6],
            time: [{ start: '08:00', end: '19:00' }],
            range: [0, 100],
            ranks: ['A', 'B'],
            onlyAdult: false,
            forDriver: true,
            forPassenger: true,
            forTrip: false,
            operators: [],
          },
          start: null,
          end: null,
          max_trips: null,
          max_amount: null,
          amount_unit: IncentiveUnit.EUR,
          restrictions: [],
          formula_expression: '',
          formulas: [],
        });
        this.templates.push(<CreateCampaignInterface>{
          template_id: '5d69319a9763dc801ea78de7',
          status: 'template',
          name: 'Limiter le trafic en semaine',
          description: 'Fusce vehicula dolor arcu, sit amet blandit dolor mollis.',
          rules: new IncentiveRules({
            weekday: [0, 1, 2, 3, 4],
            time: [{ start: '06:00', end: '09:00' }, { start: '16:00', end: '19:00' }],
            range: [0, 15],
            ranks: [TripClassEnum.A, TripClassEnum.B, TripClassEnum.C],
            onlyAdult: false,
            forDriver: true,
            forPassenger: true,
            forTrip: false,
            operators: [],
          }),
          start: null,
          end: null,
          max_trips: null,
          max_amount: null,
          amount_unit: IncentiveUnit.EUR,
          restrictions: [],
          formula_expression: '',
          formulas: [],
        });
        this.templates.push(<CreateCampaignInterface>{
          template_id: '3',
          status: 'template',
          name: 'Limiter la pollution',
          description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
          rules: {
            weekday: [0],
            time: [],
            range: [0, 15],
            ranks: [],
            onlyAdult: false,
            forDriver: true,
            forPassenger: true,
            forTrip: false,
            operators: [],
          },
          start: null,
          end: null,
          max_trips: null,
          max_amount: null,
          amount_unit: IncentiveUnit.EUR,
          restrictions: [],
          formula_expression: '',
          formulas: [],
        });
        // this.templates.push(<Campaign>{
        //   _id: '4',
        //   name: 'Limiter les embouteillages du week-end',
        //   description: 'Nam porttitor blandit accumsan. Ut vel dictum sem, a preti.',
        // });
        // this.templates.push(<Campaign>{
        //   _id: '5',
        //   name: 'Limiter le trafic lors d’un évènement ponctuel',
        //   description: 'Curabitur lobortis id lorem id bibendum. Ut id consectetur.',
        // });
        // this.templates.push(<Campaign>{
        //   _id: '5',
        //   name: 'Limiter le trafic lors d’un évènement ponctuel',
        //   description: 'Curabitur lobortis id lorem id bibendum. Ut id consectetur.',
        // });
        this.campaignService._templates$.next(this.templates);
      },
    );
  }
}
