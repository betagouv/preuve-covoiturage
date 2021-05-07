import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { REGEXP } from '~/core/const/validators.const';

import { User } from '~/core/entities/authentication/user';
import { Groups } from '~/core/enums/user/groups';

@Component({
  selector: 'app-upsert',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss'],
})
export class UpsertComponent extends DestroyObservable implements OnInit {
  public form: FormGroup;

  @Input() user: User;
  @Output() onSubmit = new EventEmitter<User>();
  @Output() onReset = new EventEmitter<void>();

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup(
      {
        firstname: new FormControl(null, [Validators.required]),
        lastname: new FormControl(null, [Validators.required]),
        email: new FormControl(null, [Validators.required, Validators.pattern(REGEXP.email)]),
        phone: new FormControl(null, Validators.pattern(REGEXP.phone)),
        role: new FormControl(null),
        group: new FormControl(null),
        territory_id: new FormControl(null),
        operator_id: new FormControl(null),
      },
      {
        validators: [
          // patch dependent fields value
          // using a validator avoids having to subscribe to form.valueChanges
          ((): ValidatorFn => {
            return (form: FormGroup): ValidationErrors | null => {
              if (form.get('group').value !== Groups.Territory && form.get('role').value === 'demo') {
                form.get('role').setValue('user');
              }

              return null;
            };
          })(),

          // make sure a territory or operator is selected
          ((): ValidatorFn => {
            return (form: FormGroup): ValidationErrors | null => {
              switch (form.get('group').value) {
                case Groups.Operator:
                  if (!form.get('operator_id').value) {
                    return { operator_id: true };
                  }
                case Groups.Territory:
                  if (!form.get('territory_id').value) {
                    return { territory_id: true };
                  }
                default:
                  return null;
              }
            };
          })(),
        ],
      },
    );

    this.form.setValue(this.user.toFormValues());
  }

  public onSubmitForm(event: Event): void {
    this.onSubmit.emit(this.user.updateFromFormValues(this.form.value));
  }

  public onResetForm(): void {
    this.onReset.emit();
  }
}
