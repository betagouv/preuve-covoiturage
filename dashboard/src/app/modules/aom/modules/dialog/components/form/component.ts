import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';

import { Company, Aom, Address } from '~/entities/database/aom';
import { regexp } from '~/entities/validators';

import { AddressForm } from '~/shared/form/components/address/form';
import { CompanyForm } from '~/shared/form/components/company/form';

@Component({
  selector: 'app-aom-form',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class AomFormComponent implements OnInit {
  inseeMessage: String = '';
  @Input('aom')
  set aomInput(aom: Aom) {
    if (aom) {
      this.aomForm.patchValue(aom);
    }
  }
  @Output() answer = new EventEmitter();

  public aomForm = this.fb.group({
    name: ['', Validators.required],
    shortname: [''],
    insee: [],
    insee_main: [''],
    address: this.fb.group(new AddressForm(new Address())),
    company: this.fb.group(new CompanyForm(new Company())),
    contact: this.fb.group({
      phone: [''],
      email: ['', Validators.pattern(regexp.email)],
      rgpd_dpo: [''],
      rgpd_controller: [''],
      technical: [''],
    }),
    // network_id: number;
    // geometry: Geometry;

  });

  constructor(
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    //
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

  get aomInsee() {
    const insee = this.aomForm.value.insee;
    if (insee && insee.length > 0) {
      return insee.map(item => Object.create(
        {
          label: item,
          value: item,
        },
      ));
    }
    return [];
  }

  onInseeAdded(event: any): void {
    if (!RegExp(regexp.insee).test(event.value)) {
      this.aomForm.value.insee.pop();
      this.inseeMessage = 'Le code insee est invalide.';
    } else {
      this.inseeMessage = '';
    }
  }

  get aomFormContact() {
    return <FormArray>this.aomForm.get('contact');
  }
}
