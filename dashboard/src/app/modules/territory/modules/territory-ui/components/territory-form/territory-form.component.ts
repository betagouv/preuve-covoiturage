import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

import { FormContact } from '~/shared/modules/form/forms/form-contact';
import { FormAddress } from '~/shared/modules/form/forms/form-address';
import { Address } from '~/core/entities/shared/address';
import { Contact } from '~/core/entities/shared/contact';
import { Company, Territory } from '~/core/entities/territory/territory';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { FormCompany } from '~/shared/modules/form/forms/form-company';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';
import { CompanyService } from '~/modules/company/services/company.service';
import { TerritoryStoreService } from '~/modules/territory/services/territory-store.service';
import { CompanyInterface } from '~/core/entities/api/shared/common/interfaces/CompanyInterface';

@Component({
  selector: 'app-territory-form',
  templateUrl: './territory-form.component.html',
  styleUrls: ['./territory-form.component.scss'],
})
export class TerritoryFormComponent extends DestroyObservable implements OnInit, OnChanges {
  public territoryForm: FormGroup;

  @Input() showForm = true;
  @Input() closable = false;
  @Input() territory: Territory = null;

  @Output() close = new EventEmitter();

  fullFormMode = false;

  public editedId: number;
  private companyDetails: CompanyInterface;

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private companyService: CompanyService,
    private territoryStore: TerritoryStoreService,
  ) {
    super();
  }

  ngOnInit() {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.fullFormMode = user && user.group === UserGroupEnum.REGISTRY;
      this.initTerritoryForm();
      this.initTerritoryFormValue();
      this.checkPermissions();
      this.updateValidation();
    });
  }

  get controls() {
    return this.territoryForm.controls;
  }

  public onSubmit(): void {
    if (this.editedId) {
      const formValues = {
        ...this.territoryForm.value,
        company: {
          ...this.companyDetails,
        },
      };

      if (this.territoryForm.value.company) formValues.company.siret = this.territoryForm.value.company.siret;
      const patch$ = this.fullFormMode
        ? this.territoryStore.updateSelected(formValues)
        : this.territoryStore.patchContact(this.territoryForm.value.contacts, this.editedId);

      patch$.subscribe(
        (modifiedTerritory) => {
          this.toastr.success(`${modifiedTerritory.name} a été mis à jour !`);
          this.close.emit();
        },
        // (err) => {
        //   this.toastr.error(`Une erreur est survenue lors de la mise à jour du territoire`);
        // },
      );
    } else throw new Error('Territory creation not supported');
  }

  public onClose(): void {
    this.close.emit();
  }

  private initTerritoryFormValue(): void {
    if (this.territory) this.setTerritoryFormValue(this.territory);
  }

  private initTerritoryForm(): void {
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
        name: [''],
        shortname: [''],
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
        contacts: this.fb.group({
          gdpr_dpo: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
          gdpr_controller: this.fb.group(
            new FormContact(
              new Contact({
                firstname: null,
                lastname: null,
                email: null,
              }),
            ),
          ),
          technical: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        }),
      };
    }

    const stopFindCompany = new Subject();

    this.territoryForm = this.fb.group(formOptions);
    const companyFormGroup: FormGroup = this.territoryForm.controls.company as FormGroup;

    if (companyFormGroup) {
      companyFormGroup.controls.siret.valueChanges
        .pipe(
          throttleTime(300),
          tap(() => {
            stopFindCompany.next();
            this.companyDetails = {
              naf_entreprise: '',
              nature_juridique: '',
              rna: '',
              vat_intra: '',
            };

            companyFormGroup.patchValue({
              naf_entreprise: '',
              nature_juridique: '',
              rna: '',
              vat_intra: '',
            });
          }),
          filter((value: string) => value.length === 14 && value.match(/[0-9]{14}/) !== null),
          takeUntil(this.destroy$),
        )
        .subscribe((value) => {
          this.companyService
            .findCompany({ siret: value, source: 'remote' })
            .pipe(
              catchHttpStatus(404, (err) => {
                this.toastr.error('Entreprise non trouvée');
                throw err;
              }),
              takeUntil(stopFindCompany),
            )

            .subscribe((company) => {
              if (company) {
                this.companyDetails = {
                  naf_entreprise: company.company_naf_code ? company.company_naf_code : '',
                  nature_juridique: company.legal_nature_label ? company.legal_nature_label : '',
                  rna: company.nonprofit_code ? company.nonprofit_code : '',
                  vat_intra: company.intra_vat ? company.intra_vat : '',
                };
                companyFormGroup.patchValue(this.companyDetails);
              }
            });
        });
    }

    this.updateValidation();
  }

  private updateValidation() {
    if (this.territoryForm && this.fullFormMode) {
      this.territoryForm.controls['name'].setValidators(this.fullFormMode ? Validators.required : null);
      this.territoryForm.controls['shortname'].setValidators(this.fullFormMode ? Validators.max(12) : null);
    }
  }

  // todo: ugly ...
  private setTerritoryFormValue(territory: Territory) {
    // base values for form
    this.editedId = territory ? territory._id : null;
    console.log('this.editedId : ', this.editedId);

    const territoryEd = new Territory(territory);
    const formValues = territoryEd.toFormValues(this.fullFormMode);

    this.territoryForm.setValue(formValues);
  }

  private checkPermissions(): void {
    if (!this.authService.hasAnyPermission(['territory.update'])) {
      this.territoryForm.disable({ onlySelf: true });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['territory'] && this.territoryForm) {
      this.setTerritoryFormValue(changes['territory'].currentValue);
    }
  }
}
