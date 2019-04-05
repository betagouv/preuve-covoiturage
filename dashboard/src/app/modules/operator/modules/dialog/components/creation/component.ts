import { Component, OnInit } from '@angular/core';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';

import { GROUPS } from '~/config/groups';
import { ROLES } from '~/config/roles';
import { Operator } from '~/entities/database/operator';
import { TextboxBase } from '~/entities/form/textBoxBase';
import { INPUTS } from '~/config/inputs';
import { InputGroup } from '~/entities/form/inputGroup';

import { OperatorService } from '../../../../services/operatorService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class OperatorCreationDialogComponent implements OnInit {
  public groupList = GROUPS;
  public roleList = ROLES;
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
    const mainInputs = [
      new TextboxBase({
        key: 'nom_commercial',
        label: 'Nom commercial',
        value: null,
        required: true,
      }),

      new TextboxBase({
        key: 'raison_sociale',
        label: 'Raison Sociale',
        value: null,
        required: true,
      }),

    ];

    this.inputGroups = [

      new InputGroup({
        key : 'main',
        inputs: mainInputs,
      }),

      new InputGroup({
        title : 'Entreprise',
        key : 'company',
        inputs: INPUTS.company,
      }),


      new InputGroup({
        title : 'Adresse',
        key : 'address',
        inputs: INPUTS.address,
      }),

      new InputGroup({
        title : 'Données bancaire',
        key : 'bank',
        inputs: INPUTS.bank,
      }),
    ];
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
