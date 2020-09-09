import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { filter, takeUntil, tap, throttleTime } from 'rxjs/operators';
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
  public territoryForm: FormGroup;

  @Input() showForm = false;
  @Input() closable = false;
  @Input() territory: Territory = null;

  @Output() close = new EventEmitter();
  @ViewChild(TerritoryChildrenComponent, { static: false })
  territoryChildren: TerritoryChildrenComponent;

  fullFormMode = false;
  displayAOMActive = false;
  levelLabel = territoryLevelLabels;

  public editedId: number;
  private companyDetails: CompanyInterface;
  protected _relationDisplayMode = 'geo';
  // intermediateRelation: any;
  // protected subIgnoredIds: number[];

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
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.fullFormMode = user && user.group === UserGroupEnum.REGISTRY;
      this.initTerritoryForm();
      this.initTerritoryFormValue();
      this.checkPermissions();
      this.updateValidation();
    });
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.territoryForm.controls;
  }

  public onSubmit(): void {
    const formValues: TerritoryFormModel = {
      ...this.territoryForm.value,
    };

    if (this.territoryChildren && this.fullFormMode) {
      formValues.children = this.territoryChildren.getFlatSelectedList();
      formValues.uiSelectionState = this.territoryChildren.getUISelectionState();
      formValues.company_id = this.companyDetails ? this.companyDetails._id : null;
    }

    const save = () => {
      if (this.editedId) {
        // if (this.territoryForm.value.company) formValues.company.siret = this.territoryForm.value.company.siret;
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
        this.territoryStore.create(formValues).subscribe((createdTerritory) => {
          this.toastr.success(`${formValues.name} a été mis à jour !`);
          this.close.emit();
        });
      }
    };

    // get territories
    if (formValues.format === 'insee' && formValues.insee) {
      const insees = formValues.insee.split(' ').join('').split(',');
      this.territoryApi.findByInsees(insees).subscribe((territories) => {
        if (insees.length === territories.length) {
          formValues.children = territories.map((t) => t._id);
          // delete formValues.insee;
          save.apply(this);
        } else {
          const notMatchingInsees = insees.filter((insee) => !territories.find((t) => t.insee === insee));
          this.toastr.error(`Some INSEE Have no territory match on our database : ${notMatchingInsees.join(',')}`);
        }
      });
    } else {
      save.apply(this);
    }
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

    if (this.territoryForm && this.territoryForm.controls && this.territoryForm.controls.format) {
      this.territoryForm.controls.format.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val) => {
        this._relationDisplayMode = val;
      });
    }

    if (companyFormGroup) {
      this.territoryForm.controls.activable.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val) => {
        this.displayAOMActive = val;
        // reset is val to false if activable is off
        this.territoryForm.patchValue({ active: this.territoryForm.value.active && val });
        // console.log('>> activable val', val);
      });

      companyFormGroup.controls.siret.valueChanges
        .pipe(
          throttleTime(300),
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
              // if (company) {
              //   this.companyDetails = {
              //     naf_entreprise: company.company_naf_code ? company.company_naf_code : '',
              //     nature_juridique: company.legal_nature_label ? company.legal_nature_label : '',
              //     rna: company.nonprofit_code ? company.nonprofit_code : '',
              //     vat_intra: company.intra_vat ? company.intra_vat : '',
              //     _id: company._id,
              //   };

              //   companyFormGroup.patchValue(this.companyDetails);
              // }
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
        naf_entreprise: company.company_naf_code ? company.company_naf_code : '',
        nature_juridique: company.legal_nature_label ? company.legal_nature_label : '',
        rna: company.nonprofit_code ? company.nonprofit_code : '',
        vat_intra: company.intra_vat ? company.intra_vat : '',
        _id: company._id,
      };

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
    }
  }

  // todo: ugly ...
  private setTerritoryFormValue(territory: Territory): void {
    // base values for form
    this.editedId = territory ? territory._id : null;
    const territoryEd = new Territory(territory);
    const formValues = territoryEd.toFormValues(this.fullFormMode);

    delete formValues.uiSelectionState;
    this.territoryForm.setValue(formValues);

    this._relationDisplayMode = formValues.format;

    if (this.editedId && this.fullFormMode) {
      this.territoryApi.getRelationUIStatus(this.editedId).subscribe((completeRelation) => {
        this.territoryChildren.setRelations(completeRelation);

        if (territory.company_id) {
          this.companyService.getById(territory.company_id).subscribe((company) => {
            this.updateCompanyForm(company);
          });
        }
      });
    } else if (this.territoryChildren) {
      this.territoryChildren.setRelations([]);
    }

    this.displayAOMActive = territory.activable === true;
  }

  get relationDisplayMode(): string {
    return this._relationDisplayMode;
    // return this.territoryForm.value.format;
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
