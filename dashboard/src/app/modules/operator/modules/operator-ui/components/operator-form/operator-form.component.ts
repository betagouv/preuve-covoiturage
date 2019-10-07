import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class OperatorFormComponent extends DestroyObservable implements OnInit {
  public operatorForm: FormGroup;

  @Input() showForm = true;
  @Input() closable = false;
  @Input() isCreating = false;

  @Output() close = new EventEmitter();

  canSeeFullForm = false;

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private _operatorService: OperatorService,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    this.initOperatorForm();
    this.initOperatorFormValue();
    this.checkPermissions();

    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => (this.canSeeFullForm = user && user.group === UserGroupEnum.REGISTRY));
  }

  get controls() {
    return this.operatorForm.controls;
  }

  get loading(): boolean {
    return this._operatorService.loading;
  }

  public onSubmit(): void {
    const operator = new Operator(this.operatorForm.value);
    if (operator._id) {
      this._operatorService.patchList(this.operatorForm.value).subscribe(
        (data) => {
          const modifiedOperator = data[0];
          this.toastr.success(`${modifiedOperator.nom_commercial} a été mis à jour !`);
        },
        (err) => {
          this.toastr.error(`Une erreur est survenue lors de la mis à jour de l'opérateur`);
        },
      );
    } else {
      this._operatorService.createList(this.operatorForm.value).subscribe(
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
    this._operatorService.operator$.pipe(takeUntil(this.destroy$)).subscribe((operator: Operator | null) => {
      if (operator) {
        this.setOperatorFormValue(operator);
      }
    });
  }

  // todo: ugly ...
  private setOperatorFormValue(operator: Operator) {
    // base values for form
    const operatorConstruct = new Operator({
      _id: null,
      nom_commercial: null,
      raison_sociale: null,
      contacts: new Contacts(),
    });

    // @ts-ignore
    const { contacts, ...operatorParams } = new Operator({ ...operator });
    operatorParams['contacts'] = new Contacts(contacts);

    // // get values in correct format with initialized values
    let formValues: any = {
      _id: operatorParams._id,

      contacts: new Contacts({
        gdpr_dpo: {
          ...operatorConstruct.contacts.gdpr_dpo,
          ...operatorParams['contacts'].gdpr_dpo,
        },
        gdpr_controller: {
          ...operatorConstruct.contacts.gdpr_controller,
          ...operatorParams['contacts'].gdpr_controller,
        },
        technical: {
          ...operatorConstruct.contacts.technical,
          ...operatorParams['contacts'].technical,
        },
      }),
    };
    if (this.canSeeFullForm) {
      formValues = {
        ...formValues,
        ...{
          nom_commercial: operatorParams.nom_commercial,
          raison_sociale: operatorParams.raison_sociale,
          address: new Address({
            ...operatorConstruct.address,
            ...operatorParams.address,
          }),
          bank: new Bank({
            ...operatorConstruct.bank,
            ...operatorParams.bank,
          }),
          company: new Company({
            ...operatorConstruct.company,
            ...operatorParams.company,
          }),
        },
      };
    }

    this.operatorForm.setValue(formValues);
  }

  private initOperatorForm(): void {
    this.operatorForm = this.fb.group({
      _id: [null],
      nom_commercial: ['', Validators.required],
      raison_sociale: ['', Validators.required],
      address: this.fb.group(new FormAddress(new Address({ street: null, city: null, country: null, postcode: null }))),
      company: this.fb.group(new FormCompany(new Company({ siren: null }))),
      contacts: this.fb.group({
        gdpr_dpo: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        gdpr_controller: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        technical: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
      }),
      bank: this.fb.group(new FormBank(new Bank()), { validators: bankValidator }),
    });
  }

  private checkPermissions(): void {
    if (!this.authService.hasAnyPermission(['operator.update'])) {
      this.operatorForm.disable({ onlySelf: true });
    }
  }
}
