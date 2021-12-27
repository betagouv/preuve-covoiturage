import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { TerritoryLevelEnum } from '../../../../../../../../../shared/territory/common/interfaces/TerritoryInterface';
import { User } from '../../../../../../core/entities/authentication/user';
import { Address } from '../../../../../../core/entities/shared/address';
import { Company } from '../../../../../../core/entities/shared/company';
import { CompanyV2 } from '../../../../../../core/entities/shared/companyV2';
import { Contact } from '../../../../../../core/entities/shared/contact';
import { Contacts } from '../../../../../../core/entities/shared/contacts';
import { Territory, TerritoryBase } from '../../../../../../core/entities/territory/territory';
import { Groups } from '../../../../../../core/enums/user/groups';
import { Roles } from '../../../../../../core/enums/user/roles';
import { AuthenticationService } from '../../../../../../core/services/authentication/authentication.service';
import { FormAddress } from '../../../../../../shared/modules/form/forms/form-address';
import { FormCompany } from '../../../../../../shared/modules/form/forms/form-company';
import { FormContact } from '../../../../../../shared/modules/form/forms/form-contact';
import { CompanyService } from '../../../../../company/services/company.service';
import { TerritoryApiService } from '../../../../services/territory-api.service';
import { TerritoryStoreService } from '../../../../services/territory-store.service';
import { TerritoryFormComponent } from './territory-form.component';

describe('TerritoryFormComponent', () => {
  const territoryApiServiceSpy = jasmine.createSpyObj<TerritoryApiService>('TerritoryApiService', {
    createNew: of({
      level: TerritoryLevelEnum.Towngroup,
      name: "Communauté de communes du Pays de L'Arbresle",
      company_id: 3,
      children: [1, 2],
      address: {
        street: '',
        postcode: '',
        city: '',
        country: '',
      },
    }),
    findByInsees: of([
      { territory_id: 1, name: '' },
      { territory_id: 2, name: '' },
    ]),
  });

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TerritoryFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        {
          provide: CompanyService,
          useValue: {
            getById(id: number): Observable<Partial<CompanyV2>> {
              return of({
                siret: '24690062500012',
                siren: null,
                legal_name: 'COMMUNAUTE COMMUNES PAYS DE L ARBRESLE',
                company_naf_code: '8411Z',
                intra_vat: 'FR90246900625',
                address_street: '117 RUE PIERRE PASSEMARD',
                address_city: "L'ARBRESLE",
                address_postcode: '69210',
              });
            },
            fetchCompany(siret: string): Observable<Partial<CompanyV2>> {
              return of({
                _id: 4,
                siret: '24690062500012',
                siren: null,
                legal_name: 'COMMUNAUTE COMMUNES PAYS DE L ARBRESLE',
                company_naf_code: '8411Z',
                intra_vat: 'FR90246900625',
                address_street: '117 RUE PIERRE PASSEMARD',
                address_city: "L'ARBRESLE",
                address_postcode: '69210',
              });
            },
          },
        },
        {
          provide: ToastrService,
          useValue: {
            success: () => {},
          },
        },
        {
          provide: TerritoryApiService,
          useValue: territoryApiServiceSpy,
        },
        {
          provide: AuthenticationService,
          useValue: {
            get user$(): Observable<User> {
              return new Observable((subscriber) => {
                subscriber.next(new User({ group: Groups.Registry }));
              });
            },
            hasRole(role: Roles | Roles[], user: User): boolean {
              const roles = Array.isArray(role) ? role : [role];
              if (!user) return false;
              return roles.indexOf(user.role) > -1;
            },
          },
        },
        { provide: TerritoryStoreService, useValue: {} },
      ],
    }).compileComponents(),
  );

  it('should load empty form when new territory', async () => {
    // Arrange
    const fixture = TestBed.createComponent(TerritoryFormComponent);
    const comp = fixture.componentInstance;
    // Assert
    expect(comp).toBeTruthy();
    fixture.detectChanges();
    await fixture.whenStable().then(() => {
      expect(comp.territoryForm.get('name').value).toEqual('');
      expect(comp.territoryForm.get('address').get('street').value).toBeUndefined();
      expect(comp.territoryForm.get('address').get('city').value).toBeUndefined();
      expect(comp.territoryForm.get('address').get('postcode').value).toBeUndefined();
      expect(comp.territoryForm.get('company').get('siret').value).toEqual('');
      expect(comp.territoryForm.get('contacts').get('gdpr_dpo').get('email').value).toBeUndefined('');
      expect(comp.territoryForm.get('contacts').get('gdpr_controller').get('email').value).toBeUndefined();
      expect(comp.territoryForm.get('contacts').get('technical').get('email').value).toBeUndefined();
    });
  });

  // TODO: merge with previous test
  it('should submit new territory form', async () => {
    // Arrange
    const fixture = TestBed.createComponent(TerritoryFormComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();

    // Act
    // detect siret change
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 300)); // wait for throttleTime
    comp.territoryForm.controls.company.get('siret').setValue('24690062500012');
    comp.territoryForm.controls.name.setValue("Communauté de communes du Pays de L'Arbresle");
    comp.territoryForm.controls.inseeString.setValue('69010,69021');
    fixture.detectChanges();

    await fixture.whenStable().then(() => {
      comp.onSubmit();

      // Assert
      expect(territoryApiServiceSpy.createNew).toHaveBeenCalled();
      expect(territoryApiServiceSpy.createNew).toHaveBeenCalledWith({
        name: "Communauté de communes du Pays de L'Arbresle",
        company_id: 4,
        contacts: {
          gdpr_controller: { firstname: undefined, lastname: undefined, email: undefined, phone: undefined },
        },
        level: TerritoryLevelEnum.Towngroup,
        address: {
          street: null,
          postcode: null,
          city: null,
          country: null,
        },
        children: [1, 2],
      });
    });
  });

  it('should load existing territory with company if exists', async () => {
    // Arrange
    const fixture = TestBed.createComponent(TerritoryFormComponent);
    const comp = fixture.componentInstance;

    const baseTerritory: TerritoryBase = {
      _id: 1,
      name: "Communauté de communes du Pays de L'Arbresle",
      level: TerritoryLevelEnum.Towngroup,
      address: { street: undefined, postcode: undefined, city: undefined, country: undefined },
      contacts: new Contacts({
        gdpr_dpo: new Contact({ firstname: '', lastname: '', email: 'gdpr_dpo@mail.com' }),
        gdpr_controller: new Contact({ firstname: '', lastname: '', email: 'gdpr_controller@mail.com' }),
        technical: new Contact({ firstname: '', lastname: '', email: 'technical@mail.com' }),
      }),
      children: [],
      company_id: 2,
    };
    const territory: Territory = new Territory(null);

    comp.territory = new Territory(territory.map(baseTerritory));
    fixture.detectChanges();

    // Assert
    await fixture.whenStable().then(() => {
      expect(comp.territoryForm.get('name').value).toEqual("Communauté de communes du Pays de L'Arbresle");

      // contacts email
      expect(comp.territoryForm.get('contacts').get('gdpr_dpo').get('email').value).toEqual('gdpr_dpo@mail.com');
      expect(comp.territoryForm.get('contacts').get('gdpr_controller').get('email').value).toEqual(
        'gdpr_controller@mail.com',
      );
      expect(comp.territoryForm.get('contacts').get('technical').get('email').value).toEqual('technical@mail.com');

      // company
      expect(comp.territoryForm.get('company').get('siret').value).toEqual('24690062500012');

      // company address
      expect(comp.territoryForm.get('address').get('street').value).toEqual('117 RUE PIERRE PASSEMARD');
      expect(comp.territoryForm.get('address').get('city').value).toEqual("L'ARBRESLE");
      expect(comp.territoryForm.get('address').get('postcode').value).toEqual('69210');
    });
  });
});
