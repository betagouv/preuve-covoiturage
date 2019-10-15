import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { Address, Bank, Company, Contacts, Operator } from '~/core/entities/operator/operator';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-operator-details',
  templateUrl: './operator-details.component.html',
  styleUrls: ['./operator-details.component.scss'],
})
export class OperatorDetailsComponent extends DestroyObservable implements OnInit, OnChanges {
  @Input() public operator: Operator;
  @Input() displayContacts = true;

  constructor(public authService: AuthenticationService, private fb: FormBuilder, private toastr: ToastrService) {
    super();
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['operator']) {
      console.log(changes['operator'].currentValue);

      this.setOperatorDetails(changes['operator'].currentValue);
    }
  }

  private setOperatorDetails(operator: Operator) {
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
