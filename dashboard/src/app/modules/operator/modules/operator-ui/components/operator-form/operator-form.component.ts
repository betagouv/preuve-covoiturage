import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { OperatorService } from '~/modules/operator/services/operator.service';
import { Address, Bank, Company, Operator } from '~/core/entities/operator/operator';
import { FormAddress } from '~/shared/modules/form/forms/form-address';
import { FormCompany } from '~/shared/modules/form/forms/form-company';
import { FormContact } from '~/shared/modules/form/forms/form-contact';
import { Contact } from '~/core/entities/shared/contact';
import { FormBank } from '~/shared/modules/form/forms/form-bank';
import { bankValidator } from '~/shared/modules/form/validators/bank.validator';

@Component({
  selector: 'app-operator-form',
  templateUrl: './operator-form.component.html',
  styleUrls: ['./operator-form.component.scss'],
})
export class OperatorFormComponent implements OnInit {
  public operatorForm: FormGroup;

  constructor(
    public authService: AuthenticationService,
    private fb: FormBuilder,
    private _operatorService: OperatorService,
  ) {}

  ngOnInit() {
    this.initOperatorForm();
    this.initOperatorFormValue();
    this.checkPermissions();
  }

  get controls() {
    return this.operatorForm.controls;
  }

  public onSubmit(): void {
    if ('_id' in this.operatorForm.value) {
      this._operatorService.patch(this.operatorForm.value);
    }
  }

  private initOperatorFormValue(): void {
    this._operatorService.loadOne().subscribe(
      () => {},
      (err) => {
        // TODO TMP DELETE WHEN BACK IS LINKED
        const operator = new Operator({
          _id: '5c66d89760e6ee004a6cab1f',
          nom_commercial: 'Opérateur',
          raison_sociale: 'Opérateur SAS',
          company: new Company({
            siren: '123456789',
            naf_entreprise: '1234A',
          }),
          address: new Address({
            street: '5 rue de brest',
            postcode: '69002',
            city: 'Lyon',
            country: 'France',
          }),
        });

        this._operatorService._entity$.next(operator);
      },
    );
    this._operatorService.operator$.subscribe((operator: Operator | null) => {
      if (operator) {
        const { raison_sociale, nom_commercial, address, company, contacts, bank } = operator;
        this.operatorForm.setValue({ raison_sociale, nom_commercial, address, company, contacts, bank });
      }
    });
  }

  private initOperatorForm(): void {
    this.operatorForm = this.fb.group({
      nom_commercial: ['', Validators.required],
      raison_sociale: ['', Validators.required],
      address: this.fb.group(new FormAddress(new Address({ street: null, city: null, country: null, postcode: null }))),
      company: this.fb.group(new FormCompany(new Company({ siren: null }))),
      contacts: this.fb.group({
        rgpd_dpo: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
        rgpd_controller: this.fb.group(new FormContact(new Contact({ firstname: null, lastname: null, email: null }))),
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
