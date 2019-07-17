import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { User } from '~/entities/database/user/user';

@Component({
  selector: 'app-company-form',
  templateUrl: './template.html',
})
export class CompanyFormComponent {
  @Input() parentForm: FormGroup;
}
