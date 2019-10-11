import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { FormCompany } from '~/shared/modules/form/forms/form-company';
import { FormContact } from '~/shared/modules/form/forms/form-contact';
import { FormAddress } from '~/shared/modules/form/forms/form-address';
import { Address } from '~/core/entities/shared/address';
import { Company } from '~/core/entities/shared/company';
import { Contact } from '~/core/entities/shared/contact';
import { Contacts, Territory } from '~/core/entities/territory/territory';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { TerritoryService } from '~/modules/territory/services/territory.service';

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

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private _territoryService: TerritoryService,
    private toastr: ToastrService,
    private commonDataService: CommonDataService,
  ) {
    super();
  }

  ngOnInit() {
    this.initTerritoryForm();
    this.initTerritoryFormValue();
    this.checkPermissions();

    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.fullFormMode = user && user.group === UserGroupEnum.REGISTRY;
      this.updateValidation();
    });
  }

  get controls() {
    return this.territoryForm.controls;
  }

  get loading(): boolean {
    return this._territoryService.loading;
  }

  public onSubmit(): void {
    const territory = new Territory(this.territoryForm.value);
    if (territory._id) {
      const formData = this.fullFormMode
        ? this.territoryForm.value
        : {
            _id: territory._id,
            contacts: this.territoryForm.value.contacts,
          };

      const patch$ = this.fullFormMode
        ? this._territoryService.patchList(formData)
        : this._territoryService.patchContactList({ ...formData.contacts, _id: formData._id });

      patch$.subscribe(
        (data) => {
          const modifiedTerritory = data[0];
          this.toastr.success(`${modifiedTerritory.name} a été mis à jour !`);
        },
        (err) => {
          this.toastr.error(`Une erreur est survenue lors de la mis à jour du territoire`);
        },
      );
    }
  }

  public onClose(): void {
    this.close.emit();
  }

  private initTerritoryFormValue(): void {
    if (this.territory) this.setTerritoryFormValue(this.territory);
  }

  private initTerritoryForm(): void {
    this.territoryForm = this.fb.group({
      _id: [null],
      name: [''],
      acronym: [''],
      address: this.fb.group(new FormAddress(new Address({ street: null, city: null, country: null, postcode: null }))),
      company: this.fb.group(new FormCompany(new Company({ siren: null }))),
      contacts: this.fb.group({
        gdpr_dpo: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        gdpr_controller: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        technical: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
      }),
    });

    this.updateValidation();
  }

  private updateValidation() {
    console.log('updateValidation', this.fullFormMode);
    if (this.territoryForm) {
      this.territoryForm.controls['name'].setValidators(this.fullFormMode ? Validators.required : null);
      this.territoryForm.controls['acronym'].setValidators(this.fullFormMode ? Validators.max(12) : null);
    }
  }

  // todo: ugly ...
  private setTerritoryFormValue(territory: Territory) {
    // base values for form
    const territoryConstruct = new Territory({
      _id: null,
      name: null,
      acronym: null,
      contacts: new Contacts(),
    });

    // @ts-ignore
    const { contacts, ...territoryParams } = new Territory({ ...territory });
    territoryParams.contacts = new Contacts(contacts);

    // // get values in correct format with initialized values
    const formValues: Territory = {
      _id: territoryParams._id,
      name: territoryParams.name,
      acronym: territoryParams.acronym,
      address: new Address({
        ...territoryConstruct.address,
        ...territoryParams.address,
      }),
      company: new Company({
        ...territoryConstruct.company,
        ...territoryParams.company,
      }),
      contacts: new Contacts({
        gdpr_dpo: {
          ...territoryConstruct.contacts.gdpr_dpo,
          ...territoryParams.contacts.gdpr_dpo,
        },
        gdpr_controller: {
          ...territoryConstruct.contacts.gdpr_controller,
          ...territoryParams.contacts.gdpr_controller,
        },
        technical: {
          ...territoryConstruct.contacts.technical,
          ...territoryParams.contacts.technical,
        },
      }),
    };

    this.territoryForm.setValue(formValues);
  }

  private checkPermissions(): void {
    if (!this.authService.hasAnyPermission(['territory.update'])) {
      this.territoryForm.disable({ onlySelf: true });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['territory'] && this.territoryForm) {
      console.log(changes['territory'].currentValue);

      this.setTerritoryFormValue(changes['territory'].currentValue);
    }
  }
}
