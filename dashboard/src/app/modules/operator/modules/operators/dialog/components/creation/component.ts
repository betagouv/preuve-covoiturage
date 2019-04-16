import { Component, OnInit } from '@angular/core';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';

import { Operator } from '~/entities/database/operator';
import { InputGroup } from '~/entities/form/inputGroup';

import { OperatorService } from '../../../../../services/operatorService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class OperatorCreationDialogComponent implements OnInit {
  public loading = false;
  public error = null;
  public inputGroups: InputGroup<any>[] = [];
  public form;

  constructor(
      private operatorService: OperatorService,
      public ref: DynamicDialogRef,
      public config: DynamicDialogConfig,
  ) {
  }

  ngOnInit(): void {
   //
  }

  public addOperator(operator: Operator) {
    this.loading = true;
    this.operatorService.post(operator).subscribe(
      (response) => {
        this.loading = false;
        this.ref.close(response);
      },
      () => {
        this.loading = false;
      },
    );
  }
}
