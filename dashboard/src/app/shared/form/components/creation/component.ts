import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { InputBase } from '~/entities/form/inputBase';
import { InputGroup } from '~/entities/form/inputGroup';

import { InputControlService } from '../../services/inputControlService';

@Component({
  selector: 'app-form',
  templateUrl: './template.html',
  providers: [InputControlService],
})

export class DynamicCreationComponent implements OnInit {
  @Input() inputGroups: InputGroup<any>[] = [];
  @Input() loading;
  @Output() answer = new EventEmitter();
  form: FormGroup;
  public submitted = false;

  constructor(private qcs: InputControlService) { }

  ngOnInit() {
    this.form = this.qcs.toFormGroup(this.inputGroups);
  }

  onSubmit() {
    this.submitted = true;
    this.formatFormValues(this.form.value);
  }

  formatFormValues(values) {
    const valuesEmitted = values.main;

    for (const key of Object.keys(values)) {
      if (key !== 'main') {
        valuesEmitted[key] = values[key];
      }
    }

    this.answer.emit(valuesEmitted);
  }
}
