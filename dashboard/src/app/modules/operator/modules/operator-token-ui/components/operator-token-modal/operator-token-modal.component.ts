import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { UtilsService } from '~/core/services/utils.service';

@Component({
  selector: 'app-operator-token-modal',
  templateUrl: './operator-token-modal.component.html',
  styleUrls: ['./operator-token-modal.component.scss'],
})
export class OperatorTokenModalComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string; token: string }, public utils: UtilsService) {}

  ngOnInit() {}
}
