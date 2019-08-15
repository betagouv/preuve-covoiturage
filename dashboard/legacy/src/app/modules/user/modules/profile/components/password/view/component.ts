import { Component } from '@angular/core';
import { DialogService } from 'primeng/api';

import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';

import { PasswordResetDialogComponent } from '../resetDialog/component';

@Component({
  selector: 'app-pwd-reset-view',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class PasswordResetViewComponent {
  constructor(private dialogService: DialogService) {}

  showPwdResetModal() {
    const config = {
      ...DIALOGSTYLE,
      header: 'Créer un nouveau mot de passe',
    };
    const ref = this.dialogService.open(PasswordResetDialogComponent, config);
  }
}
