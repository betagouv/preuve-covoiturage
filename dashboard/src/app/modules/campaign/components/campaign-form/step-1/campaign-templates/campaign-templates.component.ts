import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TemplateInterface } from '~/core/interfaces/campaign/templateInterface';

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

  public get parentId(): number | null {
    return this.campaignForm.controls.parent_id.value;
  }

  public onTemplateCardClick(templateId: number | null) {
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
      .subscribe((templates) => {
        this.templates = templates;
      });
  }
}
