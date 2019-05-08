import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/api';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class OperatorNewTokenDialogComponent implements OnInit {
  constructor(
      public config: DynamicDialogConfig,
      public ref: DynamicDialogRef,
  ) {}

  public newToken = '';

  ngOnInit(): void {
    this.newToken = this.config.data['token'];
  }

  close():void {
    this.ref.close();
  }
}
