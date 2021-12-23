import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cloneDeep, get } from 'lodash-es';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, map, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CompanyInterface } from '~/core/entities/api/shared/common/interfaces/CompanyInterface';
import { Address } from '~/core/entities/shared/address';
import { Company } from '~/core/entities/shared/company';
import { CompanyV2 } from '~/core/entities/shared/companyV2';
import { Contact } from '~/core/entities/shared/contact';
import { Territory, TerritoryFormModel } from '~/core/entities/territory/territory';
import { Groups } from '~/core/enums/user/groups';
import { Roles } from '~/core/enums/user/roles';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CompanyService } from '~/modules/company/services/company.service';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { TerritoryStoreService } from '~/modules/territory/services/territory-store.service';
import { FormAddress } from '~/shared/modules/form/forms/form-address';
import { FormCompany } from '~/shared/modules/form/forms/form-company';
import { FormContact } from '~/shared/modules/form/forms/form-contact';
import { TerritoryInsee } from 'shared/territory/findGeoByCode.contract';

@Component({
  selector: 'app-territory-form',
  templateUrl: './territory-form.component.html',
  styleUrls: ['./territory-form.component.scss'],
})
export class TerritoryFormComponent extends DestroyObservable implements OnInit, OnChanges {
  @Input() isFormVisible = false;
  @Input() closable = false;
  @Input() territory: Territory = null;

  @Output() close = new EventEmitter();

  public territoryForm: FormGroup;
  public fullFormMode = false;
  public territoryId: number;

  private companyDetails: CompanyInterface;

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private companyService: CompanyService,
    private territoryStore: TerritoryStoreService,
    private territoryApi: TerritoryApiService,
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
        this.fullFormMode = user && user.group === Groups.Registry;
        this.initTerritoryForm();
        this.initTerritoryFormValue();
        this.updateValidation();
      });
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.territoryForm.controls;
  }

  get canUpdate(): boolean {
    return this.authService.hasRole([Roles.RegistryAdmin, Roles.TerritoryAdmin]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['territory'] && this.territoryForm) {
      this.setTerritoryFormValue(changes['territory'].currentValue);
    }
  }

  public onSubmit(): void {
    const formValues: TerritoryFormModel = cloneDeep(this.territoryForm.value);
    formValues.company_id = get(this, 'companyDetails._id', null);

    if (!this.fullFormMode) {
      this.territoryStore.patchContact(this.territoryForm.value.contacts, this.territoryId).subscribe(
        (modifiedTerritory) => {
          this.toastr.success(`${formValues.name || modifiedTerritory.name} a été mis à jour !`);
          this.close.emit();
        },
        (err) => {
          this.toastr.error(`Une erreur est survenue lors de la mise à jour du territoire`);
        },
      );
      return;
    }

    // split by and make unique
    const inseeList: string[] = [
      ...new Set(
        formValues.inseeString
          .split(/[\s,]/)
          .map((s) => s.trim())
          .filter((i) => i.length)
          .sort(),
      ),
    ];

    this.territoryApi.findByInsees(inseeList).subscribe(
      (territories) => {
        this.handleInseeToTerritoriesAndUpdate(inseeList, territories, formValues);
      },
      (err) => {
        console.error(err);
        this.toastr.error(`Une erreur est survenue lors de la validation des codes insees`);
      },
    );
  }

  private handleInseeToTerritoriesAndUpdate(
    inseeList: string[],
    territories: TerritoryInsee[],
    formValues: TerritoryFormModel,
  ): void {
    if (!this.hasSameLength(inseeList, territories)) {
      this.toastr.error(`Certains codes INSEE n'ont pas de territoires correspondants`);
      return;
    }

    formValues.children = territories.map((t) => t.territory_id);

    if (this.isNew()) {
      this.territoryStore.create(formValues).subscribe(() => {
        this.toastr.success(`${formValues.name} a été mis à jour !`);
        this.close.emit();
      });
      return;
    }

    this.territoryStore.updateSelected(formValues).subscribe(
      (modifiedTerritory) => {
        this.toastr.success(`${formValues.name || modifiedTerritory.name} a été mis à jour !`);
        this.close.emit();
      },
      (err) => {
        this.toastr.error(`Une erreur est survenue lors de la mise à jour du territoire`);
      },
    );
  }

  private isNew(): boolean {
    return !this.territoryId;
  }

  private hasSameLength(inseeList: string[], territories: TerritoryInsee[]): boolean {
    return inseeList.length === territories.length;
  }

  public onClose(): void {
    this.territoryForm.reset();
    this.close.emit();
  }

  private initTerritoryFormValue(): void {
    if (this.territory) {
      this.setTerritoryFormValue(this.territory);
    }
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
        inseeString: [''],
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
      companyFormGroup
        .get('siret')
        .valueChanges.pipe(
          throttleTime(300),
          filter((v) => !!v),
          map((value: string) => {
            // remove all non-numbers chars and max out the length to 14
            const val = value.replace(/[^0-9]/g, '').substring(0, 14);
            companyFormGroup.get('siret').setValue(val, { emitEvent: false });

            return val;
          }),
          tap(() => {
            stopFindCompany.next();
            this.companyDetails = {
              _id: null,
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
          filter((value: string) => value && value.length === 14 && value.match(/[0-9]{14}/) !== null),
          takeUntil(this.destroy$),
        )
        .subscribe((value) => {
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
              this.updateCompanyForm(company, false);
            });
        });
    }

    this.updateValidation();
  }

  private updateCompanyForm(company: CompanyV2, resetIfNull = true): void {
    const companyFormGroup: FormGroup = this.territoryForm.controls.company as FormGroup;
    if (company) {
      this.companyDetails = {
        _id: company._id,
        naf_entreprise: company.company_naf_code || '',
        nature_juridique: company.legal_nature_label || '',
        rna: company.nonprofit_code || '',
        vat_intra: company.intra_vat || '',
      };

      if (this.territoryForm.get('address.street')) {
        this.territoryForm.get('address.street').setValue(company.address_street);
      }
      if (this.territoryForm.get('address.postcode')) {
        this.territoryForm.get('address.postcode').setValue(company.address_postcode);
      }
      if (this.territoryForm.get('address.cedex')) {
        this.territoryForm.get('address.cedex').setValue(company.address_cedex);
      }
      if (this.territoryForm.get('address.city')) {
        this.territoryForm.get('address.city').setValue(company.address_city);
      }

      this.territoryForm.get('address.country').setValue('France');

      companyFormGroup.patchValue({ siret: company.siret, ...this.companyDetails });
    } else if (resetIfNull) {
      this.companyDetails = null;
      companyFormGroup.patchValue({
        naf_entreprise: '',
        nature_juridique: '',
        rna: '',
        vat_intra: '',
      });
    }
  }

  private updateValidation(): void {
    if (this.territoryForm && this.fullFormMode) {
      this.territoryForm.controls['name'].setValidators(this.fullFormMode ? Validators.required : null);
      this.territoryForm.controls['shortname'].setValidators(this.fullFormMode ? Validators.max(12) : null);
      this.territoryForm.controls['name'].updateValueAndValidity();
      this.territoryForm.controls['name'].markAsUntouched();
      this.territoryForm.controls['shortname'].updateValueAndValidity();
      this.territoryForm.controls['shortname'].markAsUntouched();

      // address is hidden and not required if territory is not activable (AOM)
      const fields = ['street', 'postcode', 'city', 'country'];
      const addressControl = this.territoryForm.controls['address'] as FormGroup;

      fields.forEach((field) => {
        const ctr = addressControl.controls[field];
        ctr.updateValueAndValidity();
        ctr.markAsUntouched();
      });

      // Siret is hidden and not required if territory is not active (AOM)
      const companyFormGroup: FormGroup = this.territoryForm.controls.company as FormGroup;
      const siretControl = companyFormGroup.controls['siret'];

      siretControl.setValidators([Validators.required]);
      siretControl.updateValueAndValidity();
      siretControl.markAsUntouched();

      const inseeControl = this.territoryForm.controls.inseeString;

      inseeControl.setValidators([Validators.pattern('^( *[0-9]{5} *,? *)+$')]);
      inseeControl.updateValueAndValidity();
      inseeControl.markAsUntouched();
    }
  }

  private setTerritoryFormValue(territory: Territory): void {
    this.territoryId = territory ? territory._id : null;
    const territoryEd = new Territory(territory);
    const formValues = territoryEd.toFormValues(this.fullFormMode);

    if (!this.territoryId) {
      ['company', 'address', 'contacts.gdpr_dpo', 'contacts.gdpr_controller', 'contacts.technical'].forEach((key) => {
        if (this.territoryForm.get(key) instanceof FormGroup) this.territoryForm.get(key).reset();
      });

      this.territoryForm.reset();
    }

    this.territoryForm.setValue(formValues);

    if (this.territoryId && this.fullFormMode) {
      if (territory.company_id) {
        this.companyService.getById(territory.company_id).subscribe((company) => {
          this.updateCompanyForm(company);
        });
      }
    }
  }
}
