import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-parameters-form',
  templateUrl: './parameters-form.component.html',
  styleUrls: ['./parameters-form.component.scss', '../campaign-sub-form.scss'],
})
export class ParametersFormComponent implements OnInit {
  @Input() campaignForm: FormGroup;

  constructor() {}

  ngOnInit() {}

  get controls() {
    return this.campaignForm.controls;
  }

  showDateLabel(): string {
    const dateBegin = this.controls.start.value;
    const dateEnd = this.controls.end.value;
    if (dateBegin && dateEnd) {
      return `Du ${dateBegin} au ${dateEnd}`;
    }
    return '';
  }
}
