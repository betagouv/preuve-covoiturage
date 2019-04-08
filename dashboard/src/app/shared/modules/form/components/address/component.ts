import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-address-form',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})

export class AddressFormComponent {
  @Input() parentForm: FormGroup;
}
