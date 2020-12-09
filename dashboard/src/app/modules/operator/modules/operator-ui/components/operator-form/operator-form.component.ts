import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { filter, takeUntil, tap, map, throttleTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { Address, Bank, Company, Operator } from '~/core/entities/operator/operator';
import { FormAddress } from '~/shared/modules/form/forms/form-address';
import { FormCompany } from '~/shared/modules/form/forms/form-company';
import { FormContact } from '~/shared/modules/form/forms/form-contact';
import { Contact } from '~/core/entities/shared/contact';
import { FormBank } from '~/shared/modules/form/forms/form-bank';
import { bankValidator } from '~/shared/modules/form/validators/bank.validator';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { CompanyService } from '~/modules/company/services/company.service';
import { OperatorStoreService } from '~/modules/operator/services/operator-store.service';
import { CompanyInterface } from '~/core/entities/api/shared/common/interfaces/CompanyInterface';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';
import { UtilsService } from '~/core/services/utils.service';
import { OperatorApiService } from '~/modules/operator/services/operator-api.service';

@Component({
  selector: 'app-operator-form',
  templateUrl: './operator-form.component.html',
  styleUrls: ['./operator-form.component.scss'],
})
export class OperatorFormComponent extends DestroyObservable implements OnInit, OnChanges {
  public operatorForm: FormGroup;

  isCreating = false;
  logoHasChanged = false;

  @Output() close = new EventEmitter();

  @Input() operator: Operator;
  @Input() showForm = true;
  @Input() closable = false;

  fullFormMode = false;
  private editedOperatorId: number;
  private companyDetails: CompanyInterface;

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private operatorStoreService: OperatorStoreService,
    private operatorApiService: OperatorApiService,
    private toastr: ToastrService,
    private companyService: CompanyService,
    private utils: UtilsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.authService.user$
      .pipe(
        filter((user) => !!user),
        takeUntil(this.destroy$),
      )
      .subscribe((user) => {
        this.fullFormMode = user && user.group === UserGroupEnum.REGISTRY;
        this.initOperatorForm();
        this.initOperatorFormValue();
        this.checkPermissions();
        this.updateValidation();
      });
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.operatorForm.controls;
  }

  public onSubmit(): void {
    const operator = new Operator(this.operatorForm.value);

    if (!this.logoHasChanged) delete operator.thumbnail;

    if (this.operatorForm.value.company) {
      operator.siret = this.operatorForm.value.company.siret;
    }

    if (this.editedOperatorId) {
      if (!this.fullFormMode && this.logoHasChanged) {
        this.operatorApiService
          .patchThumbnail({ _id: this.editedOperatorId, thumbnail: operator.thumbnail as string })
          .subscribe();
      }

      const patch$ = this.fullFormMode
        ? this.operatorStoreService.updateSelected({
            ...this.operatorForm.value,
            company: {
              ...this.companyDetails,
              siret: this.operatorForm.value.company.siret,
            },
          })
        : this.operatorStoreService.patchContact(this.operatorForm.value.contacts, this.editedOperatorId);
      patch$.subscribe(
        (modifiedOperator) => {
          this.toastr.success(`${modifiedOperator.name} a été mis à jour !`);
          this.logoHasChanged = false;

          this.close.emit();
        },
        (err) => {
          this.toastr.error(`Une erreur est survenue lors de la mis à jour de l'opérateur`);
        },
      );
    } else {
      if (!this.fullFormMode) {
        throw new Error("Can't create operator where fullFormMode is false (non register user)");
      }

      this.operatorStoreService.create(this.operatorForm.value).subscribe(
        (createdOperator) => {
          this.toastr.success(`L'opérateur ${createdOperator.name} a été créé !`);
          this.logoHasChanged = false;

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
    this.isCreating = this.operator && '_id' in this.operator ? !this.operator._id : true;
    if (this.operator) {
      this.setOperatorFormValue(this.operator);
    }
  }

  // todo: ugly ...
  private setOperatorFormValue(operator: Operator): void {
    this.isCreating = !this.operator._id;
    // base values for form
    this.editedOperatorId = operator ? operator._id : null;
    const operatorFt = new Operator(operator);
    const operatorConstruct = operatorFt.toFormValues(this.fullFormMode);
    this.operatorForm.setValue(operatorConstruct);
    this.logoHasChanged = false;
  }

  public logoChanged() {
    this.logoHasChanged = true;
  }

  private updateValidation(): void {
    if (this.operatorForm && this.fullFormMode) {
      this.operatorForm.controls['name'].setValidators(this.fullFormMode ? Validators.required : null);
      this.operatorForm.controls['legal_name'].setValidators(this.fullFormMode ? Validators.required : null);
    }
  }

  private initOperatorForm(): void {
    let formOptions: any = {
      contacts: this.fb.group({
        gdpr_dpo: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        gdpr_controller: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        technical: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
      }),
      thumbnail: [null],
    };

    if (this.fullFormMode) {
      formOptions = {
        ...formOptions,
        name: [''],
        legal_name: [''],
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

        company: this.fb.group(new FormCompany({ siret: '', company: new Company() })),
        bank: this.fb.group(new FormBank(new Bank()), { validators: bankValidator }),
      };
    }

    this.operatorForm = this.fb.group(formOptions);

    const stopFindCompany = new Subject();

    const companyFormGroup: FormGroup = this.operatorForm.controls.company as FormGroup;
    if (companyFormGroup) {
      companyFormGroup.controls.siret.valueChanges
        .pipe(
          throttleTime(300),
          map((value: string) => {
            // remove all non-numbers chars and max out the length to 14
            const val = value.replace(/[^0-9]/g, '').substring(0, 14);
            companyFormGroup.get('siret').setValue(val, { emitEvent: false });

            return val;
          }),
          tap(() => {
            stopFindCompany.next();
            this.companyDetails = {
              naf_entreprise: '',
              nature_juridique: '',
              rna: '',
              vat_intra: '',
              _id: null,
            };
            companyFormGroup.patchValue(this.companyDetails);
          }),
          filter((value: string) => {
            return value.length === 14 && value.match(/[0-9]{14}/) !== null;
          }),
          takeUntil(this.destroy$),
        )
        .subscribe((value) => {
          // TODO : apply company migration
          // return null;

          this.companyService
            .fetchCompany(value)
            .pipe(
              catchHttpStatus(404, (err) => {
                this.toastr.error('Entreprise non trouvée');
                throw err;
              }),
              takeUntil(stopFindCompany),
            )
            .subscribe((company) => {
              if (company) {
                // set legal_name for empty name and legal_name values
                if (!this.operatorForm.get('name').value) {
                  this.operatorForm.get('name').setValue(company.legal_name);
                }

                if (!this.operatorForm.get('legal_name').value) {
                  this.operatorForm.get('legal_name').setValue(company.legal_name);
                }

                if (!this.operatorForm.get('address.street').value) {
                  this.operatorForm.get('address.street').setValue(company.address_street);
                }

                if (!this.operatorForm.get('address.postcode').value) {
                  this.operatorForm.get('address.postcode').setValue(company.address_postcode);
                }

                if (!this.operatorForm.get('address.cedex').value) {
                  this.operatorForm.get('address.cedex').setValue(company.address_cedex);
                }

                if (!this.operatorForm.get('address.city').value) {
                  this.operatorForm.get('address.city').setValue(company.address_city);
                }

                // set country to France if we have data on the company
                // as the API only replies for French companies
                if (!this.operatorForm.get('address.country').value) {
                  this.operatorForm.get('address.country').setValue('France');
                }

                // set company details
                this.companyDetails = {
                  _id: company._id,
                  rna: company.nonprofit_code || '',
                  vat_intra: company.intra_vat || '',
                  naf_entreprise: company.company_naf_code || '',
                  nature_juridique: company.legal_nature_label || '',
                };
                companyFormGroup.patchValue(this.companyDetails);
              }
            });
        });
    }

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
