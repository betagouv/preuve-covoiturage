import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { User } from '~/entities/database/user/user';

@Component({
  selector: 'app-contacts-form',
  templateUrl: './template.html',
})

export class ContactsFormComponent {
  @Input() parentForm: FormGroup;
  @Input() users: User[];
}
