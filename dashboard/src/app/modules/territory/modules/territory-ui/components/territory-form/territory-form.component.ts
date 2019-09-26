import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import { FormCompany } from '~/shared/modules/form/forms/form-company';
import { FormContact } from '~/shared/modules/form/forms/form-contact';
import { FormAddress } from '~/shared/modules/form/forms/form-address';
import { Address } from '~/core/entities/shared/address';
import { Company } from '~/core/entities/shared/company';
import { Contact } from '~/core/entities/shared/contact';
import { Contacts, Territory } from '~/core/entities/territory/territory';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';

import { TerritoryService } from '../../../../services/territory.service';

@Component({
  selector: 'app-territory-form',
  templateUrl: './territory-form.component.html',
  styleUrls: ['./territory-form.component.scss'],
})
export class TerritoryFormComponent extends DestroyObservable implements OnInit {
  public territoryForm: FormGroup;

  @Input() showForm = true;
  @Input() closable = false;

  @Output() close = new EventEmitter();

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private _territoryService: TerritoryService,
  ) {
    super();
  }

  ngOnInit() {
    this.initTerritoryForm();
    this.initTerritoryFormValue();
    this.checkPermissions();
  }

  get controls() {
    return this.territoryForm.controls;
  }

  get loading(): boolean {
    return this._territoryService.loading;
  }

  public onSubmit(): void {
    if ('_id' in this.territoryForm.value) {
      this._territoryService.patchList(this.territoryForm.value).subscribe();
    }
  }

  public onClose(): void {
    this.close.emit();
  }

  private initTerritoryFormValue(): void {
    this._territoryService.territory$.pipe(takeUntil(this.destroy$)).subscribe((territory: Territory | null) => {
      if (territory) {
        this.setTerritoryFormValue(territory);
      }
    });
  }

  private initTerritoryForm(): void {
    this.territoryForm = this.fb.group({
      _id: [null],
      name: ['', Validators.required],
      acronym: ['', Validators.max(12)],
      address: this.fb.group(new FormAddress(new Address({ street: null, city: null, country: null, postcode: null }))),
      company: this.fb.group(new FormCompany(new Company({ siren: null }))),
      contacts: this.fb.group({
        gdpr_dpo: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        gdpr_controller: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        technical: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
      }),
    });
  }

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

    console.log({ formValues });

    this.territoryForm.setValue(formValues);
  }

  private checkPermissions(): void {
    if (!this.authService.hasAnyPermission(['territory.update'])) {
      this.territoryForm.disable({ onlySelf: true });
    }
  }
}
