import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Address, Aom, Company, ContactList } from '~/entities/database/aom';
import { regexp } from '~/entities/validators';

import { AddressForm } from '~/shared/modules/form/components/address/form';
import { CompanyForm } from '~/shared/modules/form/components/company/form';
import { ContactsForm } from '~/shared/modules/form/components/contacts/form';
import { User } from '~/entities/database/user/user';

import { AomService } from '~/modules/aom/services/aomService';
import { ApiResponse } from '~/entities/responses/apiResponse';

@Component({
  selector: 'app-aom-form',
  templateUrl: 'template.html',
})
export class AomFormComponent {
  inseeMessage = '';
  users: User[] = [];

  @Output() answer = new EventEmitter();

  public aomForm = this.fb.group({
    name: ['', Validators.required],
    shortname: [''],
    acronym: ['', Validators.max(12)],
    insee: [],
    insee_main: [''],
    address: this.fb.group(new AddressForm(new Address())),
    company: this.fb.group(new CompanyForm(new Company())),
    contacts: this.fb.group(new ContactsForm(new ContactList())),
  });

  constructor(private aomService: AomService, private fb: FormBuilder) {}

  @Input('aom')
  set aomInput(aom: Aom) {
    if (aom) {
      this.setUsers(aom);
      this.aomForm.patchValue(aom);
    }
  }

  get aomInsee() {
    const insee = this.aomForm.value.insee;
    if (insee && insee.length > 0) {
      return insee.map((item) => ({
        label: item,
        value: item,
      }));
    }

    return [];
  }

  private setUsers(aom): void {
    if (aom._id) {
      this.aomService.getUsers(aom._id).subscribe((response: ApiResponse) => {
        this.users = response.data;
      });
    }
  }

  onSubmit() {
    const aom = {};
    Object.keys(this.aomForm.controls).forEach((prop) => {
      if (this.aomForm.controls[prop].dirty) {
        aom[prop] = this.aomForm.value[prop];
      }
    });
    this.answer.emit(aom);
  }

  json() {
    return JSON.stringify({ value: this.aomForm.value, valid: this.aomForm.valid });
  }

  onInseeAdded(event: any): void {
    if (!RegExp(regexp.insee).test(event.value)) {
      this.aomForm.value.insee.pop();
      this.inseeMessage = 'Le code INSEE est invalide.';
    } else {
      this.inseeMessage = '';
    }
  }
}
