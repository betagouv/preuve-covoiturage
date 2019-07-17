import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Address, Bank, Company, Operator } from '~/entities/database/operator';
import { AddressForm } from '~/shared/modules/form/components/address/form';
import { BankForm } from '~/shared/modules/form/components/bank/form';
import { CompanyForm } from '~/shared/modules/form/components/company/form';
import { ContactsForm } from '~/shared/modules/form/components/contacts/form';
import { ContactList } from '~/entities/database/contactList';
import { User } from '~/entities/database/user/user';
import { ApiResponse } from '~/entities/responses/apiResponse';
import { OperatorService } from '~/modules/operator/services/operatorService';

@Component({
  selector: 'app-operator-form',
  templateUrl: 'template.html',
})
export class OperatorFormComponent {
  users: User[];
  @Output() answer = new EventEmitter();
  public operatorForm = this.fb.group({
    nom_commercial: ['', Validators.required],
    raison_sociale: ['', Validators.required],
    address: this.fb.group(new AddressForm(new Address())),
    company: this.fb.group(new CompanyForm(new Company())),
    bank: this.fb.group(new BankForm(new Bank())),
    contacts: this.fb.group(new ContactsForm(new ContactList())),
  });

  constructor(private fb: FormBuilder, private operatorService: OperatorService) {}

  @Input('operator')
  set operatorInput(operator: Operator) {
    if (operator) {
      this.setUsers(operator);
      this.operatorForm.patchValue(operator);
    }
  }

  setUsers(operator) {
    this.operatorService.getUsers(operator._id).subscribe((response: ApiResponse) => {
      this.users = response.data;
    });
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
