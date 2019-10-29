import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';

import { UtilsService } from '~/core/services/utils.service';

@Component({
  selector: 'app-application-modal',
  templateUrl: './application-modal.component.html',
  styleUrls: ['./application-modal.component.scss'],
})
export class ApplicationModalComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { name: string; token: string },
    private _utils: UtilsService,
    private _toastr: ToastrService,
  ) {}

  ngOnInit() {}

  copierToken(token: string) {
    this._utils.copyToClipboard(token);
    this._toastr.success('Le token a été copié !');
  }
}
