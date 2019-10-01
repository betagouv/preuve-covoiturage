import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { UtilsService } from '~/core/services/utils.service';

@Component({
  selector: 'app-application-modal',
  templateUrl: './application-modal.component.html',
  styleUrls: ['./application-modal.component.scss'],
})
export class ApplicationModalComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string; token: string }, public utils: UtilsService) {}

  ngOnInit() {}
}
