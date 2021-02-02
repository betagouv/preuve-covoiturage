import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CampaignStoreService } from '~/modules/campaign/services/campaign-store.service';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';

@Component({
  selector: 'app-campaign-templates',
  templateUrl: './campaign-templates.component.html',
  styleUrls: ['./campaign-templates.component.scss'],
})
export class CampaignTemplatesComponent extends DestroyObservable implements OnInit {
  // @Input() campaignForm: FormGroup;
  @Input() parentId: number;
  @Input() isCreating: boolean;
  @Output() setTemplate = new EventEmitter();
  templates: Campaign[];

  constructor(private _campaignStoreService: CampaignStoreService, private _dialog: DialogService) {
    super();
  }

  ngOnInit(): void {
    this.loadCampaignTemplates();
  }

  // public get parentId(): number | null {
  //   return this.campaignForm.controls.parent_id.value;
  // }

  public get loading(): boolean {
    return this._campaignStoreService.isLoading;
  }

  public onTemplateCardClick(template: Campaign): void {
    if (this.isCreating) {
      return this.setTemplate.emit(template);
    }

    const title = template ? "Chargement d'un modèle" : 'Réinitialisation';
    const message = template
      ? 'Êtes-vous sûr de vouloir charger un nouveau modèle ?'
      : "Êtes-vous sûr de vouloir repartir d'un modèle vierge ?";
    this._dialog
      .confirm({ title, message, color: 'primary' })
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.setTemplate.emit(template);
        }
      });
  }

  private loadCampaignTemplates(): void {
    this._campaignStoreService.templates$.pipe(takeUntil(this.destroy$)).subscribe((templates) => {
      this.templates = templates;
    });
  }
}
