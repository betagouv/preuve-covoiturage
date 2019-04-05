import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { InputGroup } from '~/entities/form/inputGroup';
import { EditResponse } from '~/entities/responses/editResponse';

import { InputControlService } from '../../services/inputControlService';

@Component({
  selector: 'app-edition',
  styleUrls: ['style.scss'],
  templateUrl: './template.html',
  providers: [InputControlService],
})
export class DynamicEditionComponent implements OnInit {
  public inputGroups: InputGroup<any>[] = [];
  _inputValue: any;
  _label: string;

  @Input() type: string;

  @Input()
  set inputValue(inputValue: any) {
    this._inputValue = inputValue;
    this.set();
  }

  @Input()
  set label(label: string) {
    this._label = label;
    this.set();
  }

  @Input() options: [] = [];
  @Output() answer = new EventEmitter();
  public showInput = false;
  form: FormGroup;
  public submitted = false;

  constructor(private qcs: InputControlService) {
  }

  ngOnInit() {
    this.set();
  }

  set() {
    this.inputGroups = [
      new InputGroup(
        {
          key: 'main',
          inputs: [
            this.qcs.getEditableInputBase(this.type, this._label, this._inputValue, this.options),
          ],
        },
      ),
    ];
    this.form = this.qcs.toFormGroup(this.inputGroups);
  }

  onSubmit() {
    this.showInput = false;
    this.submitted = true;
    this.answer.emit(
        new EditResponse({
          confirm: true,
          value: this.form.value.main['value'],
        }),
    );
  }
}
