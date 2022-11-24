import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { REGEXP } from '~/core/const/validators.const';
import { User } from '~/core/entities/authentication/user';
import { Groups } from '~/core/enums/user/groups';
import { AuthenticationService as Auth } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { AutocompleteItem } from '../../../../../../shared/components/autocomplete/autocomplete.component';

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
  public currentUserIsRegistry = false;

  constructor(private commonData: CommonDataService, private auth: Auth) {
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
        hidden: new FormControl(false),
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

    // fetch current operator and territory to find out
    // about the connected user.
    combineLatest([this.commonData.currentOperator$, this.commonData.currentTerritory$])
      .pipe(takeUntil(this.destroy$), debounceTime(100))
      .subscribe(([operator, territory]) => {
        const values = {
          group: Groups.Registry,
          hidden: false,
          ...this.user.toFormValues(),
        };

        if (operator?._id) {
          values.group = Groups.Operator;
          values.operator_id = operator._id;
        }

        if (territory?._id) {
          values.group = Groups.Territory;
          values.territory_id = territory._id;
        }

        this.currentUserIsRegistry = !(operator?._id || territory?._id);

        this.form.setValue(values);
      });
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
