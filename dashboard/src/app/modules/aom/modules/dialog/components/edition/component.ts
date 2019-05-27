import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/api';

import { TranslationService } from '~/shared/services/translationService';
import { AuthenticationService } from '~/applicativeService/authentication/auth.service';
import { Aom } from '~/entities/database/aom';

import { AomService } from '../../../../services/aomService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class AomEditionDialogComponent implements OnInit {
  public aom: Aom;
  public values = {};
  modified = false;
  loaded = false;

  constructor(
    private translationService: TranslationService,
    private authentificationService: AuthenticationService,
    private aomService: AomService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {}

  public ngOnInit() {
    this.aom = new Aom();
    const { id } = this.config.data;
    this.aomService.getOne(id).subscribe((aom: [Aom]) => {
      this.aom = aom[0];
      this.loaded = true;
    });
  }

  public update(patch) {
    this.modified = true;
    this.aomService.patch(this.aom._id, patch).subscribe((aom: Aom) => {
      this.aom = aom;
      this.ref.close(aom);
    });
  }

  public hasPermission(permission: string): boolean {
    return this.authentificationService.hasPermission(permission);
  }
}
