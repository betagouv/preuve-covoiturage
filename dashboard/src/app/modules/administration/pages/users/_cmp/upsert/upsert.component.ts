import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { REGEXP } from '~/core/const/validators.const';

import { User } from '~/core/entities/authentication/user';
import { Groups } from '~/core/enums/user/groups';
import { CommonDataService } from '~/core/services/common-data.service';
import { AutocompleteItem } from '~/shared/components/autocomplete/autocomplete.component';

@Component({
  selector: 'app-upsert',
  templateUrl: './upsert.component.html',
  styleUrls: ['./upsert.component.scss'],
})
export class UpsertComponent extends DestroyObservable implements OnInit {
  @Input() user: User;
  @Input() fields: string[] = [
    'firstname',
    'lastname',
    'email',
    'phone',
    'group',
    'role',
    'territory_id',
    'operator_id',
  ];
  @Output() onSubmit = new EventEmitter<User>();
  @Output() onReset = new EventEmitter<void>();

  public form: FormGroup;
  public territories$: Observable<AutocompleteItem[]>;
  public operators$: Observable<AutocompleteItem[]>;

  constructor(private commonData: CommonDataService) {
    super();
  }

  ngOnInit(): void {
    // load territories and operators for autocomplete components
    this.territories$ = this.commonData.territories$.pipe(
      takeUntil(this.destroy$),
      map((ts: Array<{ _id: number; name: string }>) => ts.map(({ _id, name }) => ({ _id, name })).sort()),
    );

    this.operators$ = this.commonData.operators$.pipe(
      takeUntil(this.destroy$),
      map((ts: Array<{ _id: number; name: string }>) => ts.map(({ _id, name }) => ({ _id, name })).sort()),
    );

    this.commonData.loadTerritories();
    this.commonData.loadOperators();

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
          // return errors at the form level but mark each field
          // as invalid to keep the form status coherent.
          ((): ValidatorFn => {
            return (form: FormGroup): ValidationErrors | null => {
              switch (form.get('group').value) {
                case Groups.Operator:
                  if (!form.get('operator_id').value) {
                    form.get('operator_id').setErrors({ operator_id: true });
                    form.get('territory_id').setErrors(null);
                    return { operator_id: true };
                  }

                  form.get('operator_id').setErrors(null);
                  return null;

                case Groups.Territory:
                  if (!form.get('territory_id').value) {
                    form.get('territory_id').setErrors({ territory_id: true });
                    form.get('operator_id').setErrors(null);
                    return { territory_id: true };
                  }

                  form.get('territory_id').setErrors(null);
                  return null;

                default:
                  form.get('operator_id').setErrors(null);
                  form.get('territory_id').setErrors(null);
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

  // UI
  public isShown(f: string): boolean {
    return this.fields.indexOf(f) > -1;
  }

  public groupIs(g: string): boolean {
    return this.form.get('group').value === g;
  }

  public roleIs(r: string): boolean {
    return this.form.get('role').value === r;
  }
}
