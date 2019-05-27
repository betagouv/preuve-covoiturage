import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/api';

import { Aom } from '~/entities/database/aom';
import { AuthenticationService } from '~/applicativeService/authentication/auth.service';
import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';

import { AomService } from '~/modules/aom/services/aomService';
import { AomEditionDialogComponent } from '~/modules/aom/modules/dialog/components/edition/component';

@Component({
  selector: 'app-aom-view',
  templateUrl: 'template.html',
})
export class AomViewComponent implements OnInit {
  aom: Aom = new Aom();

  constructor(
    private authentificationService: AuthenticationService,
    private dialogService: DialogService,
    private aomsService: AomService,
  ) {}

  ngOnInit() {
    const user = this.authentificationService.getUser();
    if (user.aom) {
      this.aom._id = user.aom;
      this.get();
    }
  }

  hasRole(role: string): boolean {
    return this.authentificationService.hasRole(role);
  }

  edit(aom) {
    const config = {
      ...DIALOGSTYLE,
      header: "Éditer les données de l'AOM",
      data: {
        id: aom._id,
      },
    };

    const ref = this.dialogService.open(AomEditionDialogComponent, config);

    ref.onClose.subscribe(() => {
      this.get();
    });
  }

  private get() {
    this.aomsService.getOne(this.aom._id).subscribe((aom: [Aom]) => {
      this.set(aom[0]);
    });
  }

  private set(aom: Aom) {
    Object.assign(this.aom, aom);
  }
}
