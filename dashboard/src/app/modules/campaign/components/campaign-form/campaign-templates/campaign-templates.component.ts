import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { TemplateInterface } from '~/core/interfaces/campaign/templateInterface';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

@Component({
  selector: 'app-campaign-templates',
  templateUrl: './campaign-templates.html',
  styleUrls: ['./campaign-templates.component.scss'],
})
export class CampaignTemplatesComponent extends DestroyObservable implements OnInit {
  @Input() campaignForm: FormGroup;
  @Input() matStepper: MatStepper;
  @Output() setTemplate = new EventEmitter();
  templates: TemplateInterface[];

  constructor(public campaignService: CampaignService, private _dialog: DialogService, private toastr: ToastrService) {
    super();
  }

  ngOnInit() {
    this.loadCampaignTemplates();
  }

  public get parentId(): string | null {
    return this.campaignForm.controls.parent_id.value;
  }

  public onTemplateCardClick(templateId: string | null) {
    // if campaign form has template_id or _id
    if (this.campaignForm.controls._id.value || this.campaignForm.controls.parent_id.value) {
      const title = templateId ? "Chargement d'un modèle" : 'Réinitialisation';
      const message = templateId
        ? 'Êtes-vous sûr de vouloir charger un nouveau modèle ?'
        : "Êtes-vous sûr de vouloir repartir d'un modèle vierge ?";
      this._dialog
        .confirm(title, message, 'Confirmer')
        .pipe(takeUntil(this.destroy$))
        .subscribe((result) => {
          if (result) {
            this.matStepper.next();
            this.setTemplate.emit(templateId);
          }
        });
    } else {
      this.matStepper.next();
      this.setTemplate.emit(templateId);
    }
  }

  private loadCampaignTemplates() {
    this.campaignService
      .loadTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (templates) => {
          this.templates = templates;
        },
        (err) => {
          this.toastr.error(err.message);

          // TODO TMP TO DELETE
          this.templates = [];
          this.templates.push({
            _id: '5d6930724f56e6e1d0654542',
            parent_id: null,
            status: CampaignStatusEnum.TEMPLATE,
            name: 'Encourager le covoiturage',
            description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
            filters: {
              weekday: [0, 1, 2, 3, 4, 5, 6],
              time: [{ start: '08:00', end: '19:00' }],
              distance_range: {
                min: 0,
                max: 100,
              },
              rank: [TripRankEnum.A, TripRankEnum.B, TripRankEnum.C],
              operator_ids: [],
            },
            start: null,
            end: null,
            unit: IncentiveUnitEnum.EUR,
            retribution_rules: [],
            ui_status: {
              for_driver: true,
              for_passenger: true,
              for_trip: false,
            },
          });
          this.templates.push({
            _id: '5d6930724f56e6e1d0654543',
            parent_id: null,
            status: CampaignStatusEnum.TEMPLATE,
            name: 'Limiter le trafic en semaine',
            description: 'Fusce vehicula dolor arcu, sit amet blandit dolor mollis.',
            filters: {
              weekday: [0, 1, 2, 3, 4],
              time: [{ start: '06:00', end: '09:00' }, { start: '16:00', end: '19:00' }],
              distance_range: {
                min: 0,
                max: 15,
              },
              rank: [TripRankEnum.A, TripRankEnum.B, TripRankEnum.C],
              operator_ids: [],
            },
            ui_status: {
              for_driver: true,
              for_passenger: true,
              for_trip: false,
            },
            start: null,
            end: null,
            unit: IncentiveUnitEnum.EUR,
            retribution_rules: [],
          });
          this.templates.push({
            _id: '5d6930724f56e6e1d065454',
            parent_id: null,
            status: CampaignStatusEnum.TEMPLATE,
            name: 'Limiter la pollution',
            description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
            filters: {
              weekday: [0],
              time: [],
              distance_range: {
                min: 0,
                max: 15,
              },
              rank: [],
              operator_ids: [],
            },
            ui_status: {
              for_driver: true,
              for_passenger: true,
              for_trip: false,
            },
            start: null,
            end: null,
            unit: IncentiveUnitEnum.EUR,
            retribution_rules: [],
          });
          this.campaignService._templates$.next(this.templates);
        },
      );
  }
}
