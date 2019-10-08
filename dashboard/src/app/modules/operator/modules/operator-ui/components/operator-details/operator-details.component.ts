import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { OperatorService } from '~/modules/operator/services/operator.service';
import { Address, Bank, Company, Contacts, Operator } from '~/core/entities/operator/operator';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-operator-details',
  templateUrl: './operator-details.component.html',
  styleUrls: ['./operator-details.component.scss'],
})
export class OperatorDetailsComponent extends DestroyObservable implements OnInit {
  public operator: Operator;

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private _operatorService: OperatorService,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    console.log('ngOnInit');
    this._operatorService.operator$.pipe(takeUntil(this.destroy$)).subscribe((operator: Operator) => {
      console.log('operator : ', operator);
      if (operator) {
        this.setOperatorFormValue(operator);
      }
    });
  }

  private setOperatorFormValue(operator: Operator) {
    // base values for form
    const operatorConstruct = new Operator({
      _id: null,
      nom_commercial: null,
      raison_sociale: null,
      contacts: new Contacts(),
    });

    // @ts-ignore
    const { contacts, ...operatorParams } = new Operator({ ...operator });
    operatorParams['contacts'] = new Contacts(contacts);

    // // get values in correct format with initialized values
    this.operator = {
      _id: operatorParams._id,
      nom_commercial: operatorParams.nom_commercial,
      raison_sociale: operatorParams.raison_sociale,
      address: new Address({
        ...operatorConstruct.address,
        ...operatorParams.address,
      }),
      bank: new Bank({
        ...operatorConstruct.bank,
        ...operatorParams.bank,
      }),
      company: new Company({
        ...operatorConstruct.company,
        ...operatorParams.company,
      }),
      contacts: new Contacts({
        gdpr_dpo: {
          ...operatorConstruct.contacts.gdpr_dpo,
          ...operatorParams['contacts'].gdpr_dpo,
        },
        gdpr_controller: {
          ...operatorConstruct.contacts.gdpr_controller,
          ...operatorParams['contacts'].gdpr_controller,
        },
        technical: {
          ...operatorConstruct.contacts.technical,
          ...operatorParams['contacts'].technical,
        },
      }),
    };

    console.log('this.operator : ', this.operator);
  }
}
