import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Address, Bank, Company, Operator } from '~/entities/database/operator';
import { AddressForm } from '~/shared/modules/form/components/address/form';
import { BankForm } from '~/shared/modules/form/components/bank/form';
import { CompanyForm } from '~/shared/modules/form/components/company/form';
import { ContactsForm } from '~/shared/modules/form/components/contacts/form';
import { ContactList } from '~/entities/database/contactList';
import { User } from '~/entities/database/user/user';

@Component({
  selector: 'app-operator-form',
  templateUrl: 'template.html',
})

export class OperatorFormComponent implements OnInit {
  @Input() users: User[];
  @Output() answer = new EventEmitter();
  public operatorForm = this.fb.group({
    nom_commercial: ['', Validators.required],
    raison_sociale: ['', Validators.required],
    address: this.fb.group(new AddressForm(new Address())),
    company: this.fb.group(new CompanyForm(new Company())),
    bank: this.fb.group(new BankForm(new Bank())),
    contacts: this.fb.group(new ContactsForm(new ContactList())),
  });

  constructor(
    private fb: FormBuilder,
  ) {
  }

  @Input('operator')
  set operatorInput(operator: Operator) {
    if (operator) {
      this.operatorForm.patchValue(operator);
    }
  }

  ngOnInit() {
    //
  }

  onSubmit() {
    const operator = {};
    Object.keys(this.operatorForm.controls).forEach((prop) => {
      if (this.operatorForm.controls[prop].dirty) {
        operator[prop] = this.operatorForm.value[prop];
      }
    });
    this.answer.emit(operator);
  }

  json() {
    return JSON.stringify({ value: this.operatorForm.value, valid: this.operatorForm.valid });
  }
}
