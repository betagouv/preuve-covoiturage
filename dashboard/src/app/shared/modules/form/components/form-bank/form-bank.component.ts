import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-bank',
  templateUrl: './form-bank.component.html',
  styleUrls: ['./form-bank.component.scss'],
})
export class FormBankComponent {
  @Input() parentForm: FormGroup;
}
