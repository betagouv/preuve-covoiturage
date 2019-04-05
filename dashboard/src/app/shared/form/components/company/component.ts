import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-company-form',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})

export class CompanyFormComponent {
  @Input() parentForm: FormGroup;
}
