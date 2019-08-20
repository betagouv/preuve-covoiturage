import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-bank',
  templateUrl: './form-bank.component.html',
  styleUrls: ['./form-bank.component.scss'],
})
export class FormBankComponent {
  @Input() parentForm: FormGroup;

  public allBankFieldsRequiredError = false;

  ngOnInit() {
    this.parentForm.valueChanges.subscribe((val) => {
      console.log('error', this.parentForm.hasError('allBankFieldsRequired'));
      // if (this.parentForm.hasError('allBankFieldsRequired')) {
      //   this.allBankFieldsRequiredError = true;
      // }
    });
  }

  public get bank_nameControl() {
    return this.parentForm.controls.bank_name;
  }
  public get client_nameControl() {
    return this.parentForm.controls.client_name;
  }
  public get ibanControl() {
    return this.parentForm.controls.iban;
  }
  public get bicControl() {
    return this.parentForm.controls.bic;
  }
}
