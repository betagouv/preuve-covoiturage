import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { InputBase } from '~/entities/form/inputBase';
import { TextboxBase } from '~/entities/form/textBoxBase';
import { PhoneInputBase } from '~/entities/form/phoneInputBase';
import { EmailInputBase } from '~/entities/form/emailInputBase';
import { DropdownBase } from '~/entities/form/dropdownBase';
import { SirenInputBase } from '~/entities/form/sirenInputBase';

@Injectable()
export class InputControlService {
  toFormGroup(inputs: any[]) {
    const group = <any>{};
    // this.newFormGroup(inputs);

    for (const input of inputs) {
      group[input['key']] = this.newFormGroup(input['inputs']);
    }

    return new FormGroup(group);
  }

  private newFormGroup(questions: InputBase<any>[]) {
    const group: any = {};

    questions.forEach((question) => {
      if (!question['inputGroup']) {
        group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
            : new FormControl(question.value || '');
      }
    });
    return new FormGroup(group);
  }


  public getEditableInputBase(type: string, label: string = null, value: any, options: [] = []): InputBase<any> {
    switch (type) {
      case 'text':
        return new TextboxBase(
          {
            value,
            label,
            key: 'value',
            placeholder: 'remplir',
            required: true,
          },
        );

      case 'email':
        return new EmailInputBase(
          {
            value,
            label,
            key: 'value',
            placeholder: 'remplir',
            required: true,
          },
        );

      case 'phone':
        return new PhoneInputBase(
          {
            value,
            label,
            key: 'value',
            placeholder: 'remplir',
            required: true,
          },
        );

      case 'siren':
        return new SirenInputBase(
          {
            value,
            label,
            key: 'value',
            placeholder: 'remplir',
            required: true,
          },
        );

      case 'dropdown':
        return new DropdownBase(
          {
            value,
            label,
            options,
            placeholder: 'remplir',
            key: 'value',
            required: true,
          },
        );

      default:
        return new TextboxBase(
          {
            value,
            label,
            key: 'value',
            placeholder: 'remplir',
            required: true,
          },
        );
    }
  }
}
