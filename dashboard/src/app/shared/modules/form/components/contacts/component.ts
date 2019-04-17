import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-contacts-form',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})

export class ContactsFormComponent {
  @Input() parentForm: FormGroup;
}
