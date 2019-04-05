import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Company, Operator, Bank, Address } from '~/entities/database/operator';
import { AddressForm } from '~/shared/form/components/address/form';
import { BankForm } from '~/shared/form/components/bank/form';
import { CompanyForm } from '~/shared/form/components/company/form';

@Component({
  selector: 'app-operator-form',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class OperatorFormComponent implements OnInit {
  @Input('operator')
  set operatorInput(operator: Operator) {
    if (operator) {
      this.operatorForm.patchValue(operator);
    }
  }
  @Output() answer = new EventEmitter();

  public operatorForm = this.fb.group({
    nom_commercial: ['', Validators.required],
    raison_sociale: ['', Validators.required],
    address: this.fb.group(new AddressForm(new Address())),
    company: this.fb.group(new CompanyForm(new Company())),
    bank: this.fb.group(new BankForm(new Bank())),
  });

  constructor(
    private fb: FormBuilder,
  ) {
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
