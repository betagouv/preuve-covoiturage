import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep, get } from 'lodash-es';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged, filter, map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { ContactsInterface } from '~/core/entities/api/shared/common/interfaces/ContactsInterface';
import { Address } from '~/core/entities/shared/address';
import { Company } from '~/core/entities/shared/company';
import { ContactsMapper } from '~/core/entities/shared/contacts';
import { TerritoryFormModel, TerritoryMapper } from '~/core/entities/territory/territory';
import { Groups } from '~/core/enums/user/groups';
import { Roles } from '~/core/enums/user/roles';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CompanyService } from '~/modules/company/services/company.service';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { ResultInterface as CompanyInterface } from '~/shared/company/find.contract';
import {
  CreateTerritoryGroupInterface,
  TerritoryGroupInterface,
  UpdateTerritoryGroupInterface,
} from '~/shared/territory/common/interfaces/TerritoryInterface';
import { SingleResultInterface as FindGeoBySirenResultInterface } from '~/shared/territory/findGeoBySiren.contract';
import { SingleResultInterface as GeoSingleResultInterface } from '~/shared/territory/listGeo.contract';
import { FormAddress } from '../../../../../../shared/modules/form/forms/form-address';
import { FormCompany } from '../../../../../../shared/modules/form/forms/form-company';
import { FormContact } from '../../../../../../shared/modules/form/forms/form-contact';

@Component({
  selector: 'app-territory-form',
  templateUrl: './territory-form.component.html',
  styleUrls: ['./territory-form.component.scss'],
})
export class TerritoryFormComponent extends DestroyObservable implements OnInit, OnChanges {
  @Input() territory: TerritoryGroupInterface = null;

  public isRegistryGroup = false;
  public territoryForm: FormGroup;
  public comComs: GeoSingleResultInterface[];

  private findGeoBySiretResponse: FindGeoBySirenResultInterface;
  private companyId: number;
  private company: CompanyInterface;

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private companyService: CompanyService,
    private territoryApi: TerritoryApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: { territory: TerritoryGroupInterface }) => {
      this.territory = data.territory;
    });
    this.authService.user$
      .pipe(
        filter((user) => !!user),
        takeUntil(this.destroy$),
      )
      .subscribe((user) => {
        this.isRegistryGroup = user && user.group === Groups.Registry;
        this.initFormAndValidation();
      });
  }

  ngOnChanges() {
    this.initFormAndValidation();
  }

  private initFormAndValidation() {
    this.initTerritoryForm();
    this.setTerritoryFormValue(this.territory);
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.territoryForm.controls;
  }

  get canUpdate(): boolean {
    return this.authService.hasRole([Roles.RegistryAdmin, Roles.TerritoryAdmin]);
  }

  public hasNoGeoReferential() {
    return [
      !!this.territory.selector.aom?.length,
      !!this.territory.selector.com?.length,
      !!this.territory.selector.epci?.length,
    ].every((condition) => condition === false);
  }

  public onSubmit(): void {
    const formValues: TerritoryFormModel = cloneDeep(this.territoryForm.value);
    formValues.company_id = get(this, 'companyId', null);

    if (!this.isRegistryGroup) {
      const contactModel: ContactsInterface = ContactsMapper.toModel(this.territoryForm.get('contacts'));
      this.territoryApi.patchContact({ patch: contactModel, _id: this.territory._id }).subscribe(
        (modifiedTerritory) => {
          this.toastr.success(`${formValues.name || modifiedTerritory.name} a été mis à jour !`);
        },
        (err) => {
          this.toastr.error(`Une erreur est survenue lors de la mise à jour du territoire`);
        },
      );
      return;
    }

    const aomSiren: string = this.getAOMSiren();
    const aomName: string = this.getTerritoryName();

    const createTerritory: CreateTerritoryGroupInterface = TerritoryMapper.toModel(
      this.territoryForm,
      this.companyId,
      aomSiren,
      aomName,
    );
    if (this.isNew()) {
      this.territoryApi.create(createTerritory).subscribe(() => {
        this.toastr.success(`${this.company.legal_name} a été créé !`);
        this.router.navigate(['../'], { relativeTo: this.route });
      });
      return;
    }

    const updateTerritory: UpdateTerritoryGroupInterface = { ...createTerritory, _id: this.territory._id };
    this.territoryApi.update(updateTerritory).subscribe(
      (modifiedTerritory) => {
        this.toastr.success(`${this.company.legal_name} a été mis à jour !`);
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      (err) => {
        this.toastr.error(`Une erreur est survenue lors de la mise à jour du territoire`);
      },
    );
  }

  private getTerritoryName(): string {
    if (this.company.siren === this.findGeoBySiretResponse.aom_siren) {
      return this.findGeoBySiretResponse.aom_name;
    } else if (this.company.siren === this.findGeoBySiretResponse.epci_siren) {
      return this.findGeoBySiretResponse.epci_name;
    } else return this.company.legal_name;
  }

  private getAOMSiren(): string {
    if (
      this.company.siren === this.findGeoBySiretResponse.aom_siren ||
      this.company.siren === this.findGeoBySiretResponse.epci_siren
    ) {
      return this.company.siren;
    }
    return null;
  }

  private isNew(): boolean {
    return !(this.territory && this.territory._id);
  }

  private initTerritoryForm(): void {
    const contactFormGroup = this.fb.group({
      gdpr_dpo: this.fb.group(new FormContact()),
      gdpr_controller: this.fb.group(new FormContact()),
      technical: this.fb.group(new FormContact()),
    });

    this.territoryForm = this.fb.group({
      contacts: contactFormGroup,
    });

    if (this.isRegistryGroup) {
      const companyFormGroup: FormGroup = this.fb.group(new FormCompany({ siret: '', company: new Company() }));
      const addressFormGroup: FormGroup = this.fb.group(
        new FormAddress(
          new Address({
            street: null,
            city: null,
            country: null,
            postcode: null,
          }),
        ),
      );

      Object.keys(addressFormGroup.controls).forEach((c) => {
        if (c != 'cedex') {
          addressFormGroup.get(c).setValidators([Validators.required]);
        }
      });

      companyFormGroup.get('siret').setValidators([Validators.required]);
      this.siretValueChanges(companyFormGroup);

      this.territoryForm.addControl('address', addressFormGroup);
      this.territoryForm.addControl('company', companyFormGroup);
    }
  }

  private siretValueChanges(companyFormGroup: FormGroup) {
    companyFormGroup
      .get('siret')
      .valueChanges.pipe(
        filter((v) => !!v),
        map((value: string) => {
          // remove all non-numbers chars and max out the length to 14
          const val = value.replace(/[^0-9]/g, '').substring(0, 14);
          companyFormGroup.get('siret').setValue(val, { emitEvent: false });

          return val;
        }),
        distinctUntilChanged(),
        tap(() => this.resetCompanyForm(companyFormGroup)),
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
            tap((company) => this.updateCompanyForm(company)),
            mergeMap((company) => this.territoryApi.findGeoBySiren({ siren: company.siren })),
          )
          .subscribe((geoBySirenResponse) => this.updateTerritoryGeoListOrToastError(geoBySirenResponse));
      });
  }

  private updateTerritoryGeoListOrToastError(geoBySirenResponse: FindGeoBySirenResultInterface): void {
    if (!!!geoBySirenResponse.coms.length) {
      this.toastr.info(`Aucune EPCI ou AOM correspondant à ce numéro de SIREN`);
    }
    this.findGeoBySiretResponse = geoBySirenResponse;
    this.comComs = geoBySirenResponse.coms.sort((g1, g2) => g1.name.localeCompare(g2.name));
  }

  private updateCompanyForm(company: CompanyInterface): void {
    if (!company) {
      return;
    }

    const companyFormGroup: FormGroup = this.territoryForm.controls.company as FormGroup;
    this.companyId = company._id;
    this.company = company;

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

    companyFormGroup.patchValue({
      siret: company.siret,
      _id: company._id,
      naf_entreprise: company.company_naf_code || '',
      nature_juridique: company.legal_nature_label || '',
      rna: company.nonprofit_code || '',
      vat_intra: company.intra_vat || '',
    });
  }

  private resetCompanyForm(companyFormGroup: FormGroup) {
    companyFormGroup.patchValue({
      naf_entreprise: '',
      nature_juridique: '',
      rna: '',
      vat_intra: '',
    });
  }

  private setTerritoryFormValue(territory: TerritoryGroupInterface): void {
    if (!territory) {
      return;
    }

    this.updateContactsForm(territory.contacts);
    this.updateCompanyIfExists(territory.company_id);
  }

  private updateCompanyIfExists(companyId: number) {
    if (!companyId) {
      return;
    }
    this.companyService
      .getById(companyId)
      .pipe(
        catchHttpStatus(404, (err) => {
          this.toastr.error('Entreprise non trouvée');
          throw err;
        }),
      )
      .subscribe((company) => this.updateCompanyForm(company));
  }

  private updateContactsForm(contacts: ContactsInterface) {
    const contactsFormGroup: FormGroup = this.territoryForm.controls.contacts as FormGroup;
    contactsFormGroup.patchValue({ ...contacts });
  }
}
