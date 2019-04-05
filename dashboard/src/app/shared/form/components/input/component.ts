import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { InputBase } from '~/entities/form/inputBase';

@Component({
  selector: 'app-input',
  styleUrls: ['style.scss'],
  templateUrl: './template.html',
})
export class DynamicInputComponent {
  @Input() input: InputBase<any>;
  @Input() inputClass = 'input';
  @Input() form: FormGroup;
  @Input() submitted = false;
  @Input() fgn: string = null;
  @Output() blur = new EventEmitter() ;
  get isValid() {
    return this.form.controls[this.fgn]['controls'][this.input.key].valid;
  }
  get isPristine() {
    return this.form.controls[this.fgn]['controls'][this.input.key].pristine;
  }
}
