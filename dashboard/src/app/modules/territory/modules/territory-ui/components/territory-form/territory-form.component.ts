import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { filter, takeUntil, tap, map, throttleTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

import { FormContact } from '~/shared/modules/form/forms/form-contact';
import { FormAddress } from '~/shared/modules/form/forms/form-address';
import { Address } from '~/core/entities/shared/address';
import { Contact } from '~/core/entities/shared/contact';
import { Territory, territoryLevelLabels, TerritoryFormModel } from '~/core/entities/territory/territory';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { FormCompany } from '~/shared/modules/form/forms/form-company';
import { CompanyService } from '~/modules/company/services/company.service';
import { TerritoryStoreService } from '~/modules/territory/services/territory-store.service';
import { CompanyInterface } from '~/core/entities/api/shared/common/interfaces/CompanyInterface';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { TerritoryChildrenComponent } from '../territory-children/territory-children.component';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';
import { Company } from '~/core/entities/shared/company';
import { CompanyV2 } from '~/core/entities/shared/companyV2';

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

  @ViewChild(TerritoryChildrenComponent) territoryChildren: TerritoryChildrenComponent;

  public territoryForm: FormGroup;

  fullFormMode = false;
  displayAOMActive = false;
  levelLabel = territoryLevelLabels;
  hasTerritories = false;

  public editedId: number;
  private companyDetails: CompanyInterface;
  protected _relationDisplayMode = 'parent';
  public activable = false;

  get controls(): { [key: string]: AbstractControl } {
    return this.territoryForm.controls;
  }

  get isPartner(): boolean {
    const base = this.fullFormMode ? this.territoryForm.value : this.territory;
    return base && 'activable' in base ? base.activable : false;
  }

  get relationDisplayMode(): string {
    return this._relationDisplayMode;
  }

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
        this.fullFormMode = user && user.group === UserGroupEnum.REGISTRY;
        this.initTerritoryForm();
        this.initTerritoryFormValue();
        this.checkPermissions();
        this.updateValidation();
      });

    if (this.territoryForm.controls['activable']) {
      this.territoryForm.controls['activable'].valueChanges.subscribe(() => this.updateValidation());
    }

    if (this.territoryForm.controls['format']) {
      this.territoryForm.controls['format'].valueChanges.subscribe(() => this.updateValidation());
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['territory'] && this.territoryForm) {
      this.setTerritoryFormValue(changes['territory'].currentValue);
    }
  }

  public hasTerritoriesChanged(hasTerritories: boolean): void {
    this.hasTerritories = hasTerritories;
  }

  public onSubmit(): void {
    const formValues: TerritoryFormModel = { ...this.territoryForm.value };

    if ('geo' in formValues && typeof formValues.geo === 'string' && formValues.geo.length) {
      try {
        formValues.geo = JSON.parse(formValues.geo);
      } catch (e) {
        this.toastr.error("Le format du MultiPolygon n'est pas valide");
        throw e;
      }
    }

    if (this.territoryForm.get('company') instanceof FormGroup) this.territoryForm.get('company').reset();
    if (this.territoryForm.get('address') instanceof FormGroup) this.territoryForm.get('address').reset();

    if (this.territoryChildren && this.fullFormMode && formValues.format === 'parent') {
      formValues.children = this.territoryChildren.getFlatSelectedList();
      if (formValues.children.length === 0) {
        this.toastr.error('Veuillez selectionner au moins un territoire enfant');

        return;
      }

      formValues.uiSelectionState = this.territoryChildren.getUISelectionState();
    }

    formValues.company_id = this.companyDetails ? this.companyDetails._id : null;

    const save = () => {
      if (this.editedId) {
        const patch$ = this.fullFormMode
          ? this.territoryStore.updateSelected(formValues)
          : this.territoryStore.patchContact(this.territoryForm.value.contacts, this.editedId);

        patch$.subscribe(
          (modifiedTerritory) => {
            this.toastr.success(`${formValues.name || modifiedTerritory.name} a été mis à jour !`);
            this.close.emit();
          },
          (err) => {
            this.toastr.error(`Une erreur est survenue lors de la mise à jour du territoire`);
          },
        );
      } else {
        this.territoryStore.create(formValues).subscribe(() => {
          this.toastr.success(`${formValues.name} a été mis à jour !`);
          this.close.emit();
        });
      }
    };

    // get territories
    if (formValues.format === 'insee' && formValues.insee) {
      // split by , or spaces and make unique
      const inseeList = [
        ...new Set(
          formValues.insee
            .split(/[\s,]/)
            .map((s) => s.trim())
            .filter((i) => i.length)
            .sort(),
        ),
      ];

      this.territoryApi.findByInsees(inseeList).subscribe((territories) => {
        if (inseeList.length === territories.length) {
          formValues.children = territories.map((t) => t._id);
          save.apply(this);
        } else {
          const notMatchingInsees = inseeList.filter((insee) => !territories.find((t) => t.insee === insee));
          this.toastr.error(
            `Certains codes INSEE n'ont pas de territoires correspondants : ${notMatchingInsees.join(',')}`,
          );
        }
      });
    } else {
      save.apply(this);
    }

    if (this.territoryChildren) this.territoryChildren.setRelations([]);
  }

  public onClose(): void {
    if (this.territoryChildren) this.territoryChildren.setRelations([]);
    // this.territoryForm.get('company').reset();
    // this.territoryForm.get('address').reset();
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
        active: [false],
        activable: [false],
        level: [null, Validators.required],
        shortname: [''],
        format: ['parent'],
        insee: [''],
        geo: [''],
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

        // children: [],

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

    if (this.territoryForm && this.territoryForm.get('format')) {
      this.territoryForm
        .get('format')
        .valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe((val) => {
          this._relationDisplayMode = val;
        });
    }

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
      const addressIsRequired = !!this.territoryForm.controls['activable'].value;
      const fields = ['street', 'postcode', 'city', 'country'];
      const addressControl = this.territoryForm.controls['address'] as FormGroup;

      fields.forEach((field) => {
        const ctr = addressControl.controls[field];
        ctr.setValidators(addressIsRequired ? [Validators.required] : null);
        ctr.updateValueAndValidity();
        ctr.markAsUntouched();
      });

      // Siret is hidden and not required if territory is not active (AOM)

      const companyFormGroup: FormGroup = this.territoryForm.controls.company as FormGroup;
      const siretControl = companyFormGroup.controls['siret'];

      siretControl.setValidators(addressIsRequired ? [Validators.required] : null);
      siretControl.updateValueAndValidity();
      siretControl.markAsUntouched();

      const inseeControl = this.territoryForm.controls.insee;
      const inseeIsRequired = this.territoryForm.controls['format'].value === 'insee';

      inseeControl.setValidators(
        inseeIsRequired ? [Validators.required, Validators.pattern('^( *[0-9]{5} *,? *)+$')] : null,
      );
      inseeControl.updateValueAndValidity();
      inseeControl.markAsUntouched();
    }
  }

  private setTerritoryFormValue(territory: Territory): void {
    // base values for form
    this.activable = this.territory && this.territory.activable;
    this.editedId = territory ? territory._id : null;
    const territoryEd = new Territory(territory);
    const formValues = territoryEd.toFormValues(this.fullFormMode);

    delete formValues.uiSelectionState;
    this.territoryForm.setValue(formValues);

    this._relationDisplayMode = formValues.format;
    if (this.editedId && this.fullFormMode) {
      if (formValues.format === 'parent') {
        this.hasTerritories = territory.children ? territory.children.length > 0 : false;
        this.territoryApi
          .getRelationUIStatus(this.editedId)
          .pipe(takeUntil(this.destroy$))
          .subscribe((completeRelation) => {
            if (this.territoryChildren) this.territoryChildren.setRelations(completeRelation);
          });
      } else {
        if (this.territoryChildren) this.territoryChildren.setRelations([]);
      }

      if (territory.company_id) {
        this.companyService.getById(territory.company_id).subscribe((company) => {
          this.updateCompanyForm(company);
        });
      }
      this.displayAOMActive = territory.activable === true;
    }
  }

  private checkPermissions(): void {
    if (!this.authService.hasAnyPermission(['territory.update'])) {
      this.territoryForm.disable({ onlySelf: true });
    }
  }
}
