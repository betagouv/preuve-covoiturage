import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-address',
  templateUrl: './form-address.component.html',
  styleUrls: ['./form-address.component.scss'],
})
export class FormAddressComponent {
  @Input() parentForm: FormGroup;

  ngOnInit() {
    console.log(this.parentForm);
  }
}
