import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { OperatorService } from '~/modules/operator/services/operator.service';
import { Address, Bank, Company, Contacts, Operator } from '~/core/entities/operator/operator';
import { FormAddress } from '~/shared/modules/form/forms/form-address';
import { FormCompany } from '~/shared/modules/form/forms/form-company';
import { FormContact } from '~/shared/modules/form/forms/form-contact';
import { Contact } from '~/core/entities/shared/contact';
import { FormBank } from '~/shared/modules/form/forms/form-bank';
import { bankValidator } from '~/shared/modules/form/validators/bank.validator';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

@Component({
  selector: 'app-operator-form',
  templateUrl: './operator-form.component.html',
  styleUrls: ['./operator-form.component.scss'],
})
export class OperatorFormComponent extends DestroyObservable implements OnInit, OnChanges {
  public operatorForm: FormGroup;

  isCreating = false;

  @Output() close = new EventEmitter();

  @Input() operator: Operator;
  @Input() showForm = true;
  @Input() closable = false;

  fullFormMode = false;
  private editedOperatorId: string;

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private _operatorService: OperatorService,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.fullFormMode = user && user.group === UserGroupEnum.REGISTRY;
      this.initOperatorForm();
      this.initOperatorFormValue();
      this.checkPermissions();
      this.updateValidation();
    });
  }

  get controls() {
    return this.operatorForm.controls;
  }

  get loading(): boolean {
    return this._operatorService.loading;
  }

  public onSubmit(): void {
    const operator = new Operator(this.operatorForm.value);

    console.log('operator : ', operator);
    if (this.editedOperatorId) {
      const patch$ = this.fullFormMode
        ? this._operatorService.updateList(new Operator({ ...operator, _id: this.editedOperatorId }))
        : this._operatorService.patchContactList({ ...new Contacts(operator.contacts), _id: this.editedOperatorId });
      patch$.subscribe(
        (data) => {
          const modifiedOperator = data[0];
          this.toastr.success(`${modifiedOperator.nom_commercial} a été mis à jour !`);
        },
        (err) => {
          this.toastr.error(`Une erreur est survenue lors de la mis à jour de l'opérateur`);
        },
      );
    } else {
      if (!this.fullFormMode) {
        throw new Error("Can't create operator where fullFormMode is false (non register user)");
      }

      this._operatorService.createList(operator).subscribe(
        (data) => {
          const createdOperator = data[0];
          this.toastr.success(`L'opérateur ${createdOperator.nom_commercial} a été créé !`);
          this.close.emit();
        },
        (err) => {
          this.toastr.error(`Une erreur est survenue lors de la création de l'opérateur`);
        },
      );
    }
  }

  public onClose(): void {
    this.close.emit();
  }

  private initOperatorFormValue(): void {
    this.isCreating = !this.operator;
    if (this.operator) {
      this.setOperatorFormValue(this.operator);
    }
  }

  // todo: ugly ...
  private setOperatorFormValue(operator: Operator) {
    this.isCreating = !operator;
    // base values for form
    this.editedOperatorId = operator ? operator._id : null;

    const operatorFt = new Operator(operator);
    const operatorConstruct = operatorFt.toFormValues(this.fullFormMode);

    this.operatorForm.setValue(operatorConstruct);
  }

  private updateValidation() {
    if (this.operatorForm && this.fullFormMode) {
      this.operatorForm.controls['nom_commercial'].setValidators(this.fullFormMode ? Validators.required : null);
      this.operatorForm.controls['raison_sociale'].setValidators(this.fullFormMode ? Validators.required : null);
    }
  }

  private initOperatorForm(): void {
    let formOptions: any = {
      contacts: this.fb.group({
        gdpr_dpo: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        gdpr_controller: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        technical: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
      }),
    };

    if (this.fullFormMode) {
      formOptions = {
        ...formOptions,
        nom_commercial: [''],
        raison_sociale: [''],
        address: this.fb.group(
          new FormAddress(
            new Address({
              street: null,
              city: null,
              country: null,
              postcode: null,
            }),
          ),
        ),
        company: this.fb.group(new FormCompany(new Company({ siret: null }))),
        bank: this.fb.group(new FormBank(new Bank()), { validators: bankValidator }),
      };
    }

    this.operatorForm = this.fb.group(formOptions);

    this.updateValidation();
  }

  private checkPermissions(): void {
    if (!this.authService.hasAnyPermission(['operator.update'])) {
      this.operatorForm.disable({ onlySelf: true });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['operator'] && this.operatorForm) {
      this.setOperatorFormValue(changes['operator'].currentValue);
    }
  }
}
