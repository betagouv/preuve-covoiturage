import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import { FormCompany } from '~/shared/modules/form/forms/form-company';
import { FormContact } from '~/shared/modules/form/forms/form-contact';
import { FormAddress } from '~/shared/modules/form/forms/form-address';
import { Address } from '~/core/entities/shared/address';
import { Company } from '~/core/entities/shared/company';
import { Contact } from '~/core/entities/shared/contact';
import { Territory } from '~/core/entities/territory/territory';
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

  public onSubmit(): void {
    if ('_id' in this.territoryForm.value) {
      this._territoryService.patchList(this.territoryForm.value).subscribe();
    }
  }

  private initTerritoryFormValue(): void {
    this._territoryService
      .loadOne()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this._territoryService.territory$.pipe(takeUntil(this.destroy$)).subscribe((territory: Territory | null) => {
      if (territory) {
        const { name, acronym, address, company, contacts } = territory;
        this.territoryForm.setValue({ name, acronym, address, company, contacts });
      }
    });
  }

  private initTerritoryForm(): void {
    this.territoryForm = this.fb.group({
      name: ['', Validators.required],
      acronym: ['', Validators.max(12)],
      address: this.fb.group(new FormAddress(new Address({ street: null, city: null, country: null, postcode: null }))),
      company: this.fb.group(new FormCompany(new Company({ siren: null }))),
      contacts: this.fb.group({
        rgpd_dpo: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        rgpd_controller: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        technical: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
      }),
    });
  }

  private checkPermissions(): void {
    if (!this.authService.hasAnyPermission(['territory.update'])) {
      this.territoryForm.disable({ onlySelf: true });
    }
  }
}
