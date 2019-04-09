import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-bank-form',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})

export class BankFormComponent {
  @Input() parentForm: FormGroup;
}
