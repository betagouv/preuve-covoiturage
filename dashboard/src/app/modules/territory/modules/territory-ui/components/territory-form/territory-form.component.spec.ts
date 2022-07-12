import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { CompanyService } from '~/modules/company/services/company.service';
import { ResultInterface as CompanyInterface } from '~/shared/company/find.contract';
import { User } from '../../../../../../core/entities/authentication/user';
import { Groups } from '../../../../../../core/enums/user/groups';
import { Roles } from '../../../../../../core/enums/user/roles';
import { AuthenticationService } from '../../../../../../core/services/authentication/authentication.service';
import { TerritoryApiService } from '../../../../services/territory-api.service';
import { SingleResultInterface as FindGeoBySirenResultInterface } from '~/shared/territory/findGeoBySiren.contract';
import { TerritoryCodeEnum } from '~/shared/territory/common/interfaces/TerritoryCodeInterface';
// eslint-disable-next-line max-len
import { TerritoryGroupInterface } from '~/shared/territory/common/interfaces/TerritoryInterface';
import { TerritoryFormComponent } from './territory-form.component';

describe('TerritoryFormComponent', () => {
  const findBySiretResult = {
    aom_siren: '246900625',
    aom_name: "Communauté de communes du Pays de L'Arbresle",
    epci_name: "Communauté de communes du Pays de L'Arbresle",
    epci_siren: '246900622',
    coms: [
      { insee: '08015', name: 'Antheny', _id: 1, type: TerritoryCodeEnum.City },
      { insee: '08182', name: 'Le Fréty', _id: 2, type: TerritoryCodeEnum.City },
      { insee: '08167', name: 'La Férée', _id: 3, type: TerritoryCodeEnum.City },
    ],
  };

  const paysDeArbresleCompany: CompanyInterface = {
    siret: '24690062500012',
    siren: '246900625',
    legal_name: 'COMMUNAUTE COMMUNES PAYS DE L ARBRESLE',
    company_naf_code: '8411Z',
    intra_vat: 'FR90246900625',
    address_street: '117 RUE PIERRE PASSEMARD',
    address_city: "L'ARBRESLE",
    address_postcode: '69210',
    nic: '',
    establishment_naf_code: '',
    legal_nature_code: '',
    legal_nature_label: '',
    headquarter: false,
  };

  const toursMetropoleFindGeoBySirenResult: FindGeoBySirenResultInterface = {
    aom_name: 'Syndicat des Mobilités de Touraine',
    aom_siren: '200085108',
    epci_name: 'Tours Métropole Val de Loire',
    epci_siren: '243700754',
    coms: [
      { insee: '37172', name: "Notre-Dame-d'Oé", _id: 1, type: TerritoryCodeEnum.City },
      { insee: '37109', name: 'Fondettes', _id: 1, type: TerritoryCodeEnum.City },
      { insee: '37054', name: 'Chanceaux-sur-Choisille', _id: 1, type: TerritoryCodeEnum.City },
    ],
  };

  const toursMetropoleValeLoireCompany: CompanyInterface = {
    _id: 458,
    siret: '24370075400035',
    siren: '243700754',
    nic: '00035',
    legal_name: 'TOURS METROPOLE VAL DE LOIRE',
    company_naf_code: '8411Z',
    establishment_naf_code: '8411Z',
    legal_nature_code: '7344',
    legal_nature_label: 'TOURS METROPOLE VAL DE LOIRE',
    intra_vat: 'FR82243700754',
    headquarter: true,
    nonprofit_code: null,
    address: '60 Avenue Marcel Dassault 37200 Tours',
    address_street: '60 AVENUE MARCEL DASSAULT',
    address_postcode: '37200',
    address_cedex: '37206',
    address_city: 'TOURS',
  };

  const territory: TerritoryGroupInterface = {
    _id: 44,
    name: "Communauté de communes du Pays de L'Arbresle",
    company_id: 3,
    contacts: {
      gdpr_dpo: {
        firstname: 'gdpr',
        lastname: 'dpo',
        email: 'gdpr_dpo@mail.com',
      },
      gdpr_controller: {
        firstname: 'gdpr',
        lastname: 'controller',
        email: 'gdpr_controller@mail.com',
      },
      technical: {
        firstname: 'technical',
        lastname: 'tech',
        email: 'technical@mail.com',
      },
    },
    selector: {},
    address: {
      street: '',
      postcode: '',
      city: '',
      country: '',
    },
    shortname: '',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const territoryApiServiceSpy = jasmine.createSpyObj<TerritoryApiService>('TerritoryApiService', {
    create: of(territory),
    update: of(territory),
    findGeoBySiren: of(findBySiretResult),
  });

  const companyApiServiceSpy = jasmine.createSpyObj<CompanyService>('CompanyService', {
    getById: of(paysDeArbresleCompany),
    fetchCompany: of({
      _id: 4,
      ...paysDeArbresleCompany,
    }),
  });

  describe('Create Territory Group', () => {
    beforeEach(() => {
      territoryApiServiceSpy.findGeoBySiren.and.returnValue(of(findBySiretResult));

      companyApiServiceSpy.fetchCompany.and.returnValue(
        of({
          _id: 4,
          ...paysDeArbresleCompany,
        }),
      );

      TestBed.configureTestingModule({
        declarations: [TerritoryFormComponent],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [RouterTestingModule.withRoutes([])],
        providers: [
          FormBuilder,
          {
            provide: ActivatedRoute,
            useValue: {
              data: new Observable(),
            },
          },
          {
            provide: CompanyService,
            useValue: companyApiServiceSpy,
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
        ],
      }).compileComponents();
    });

    afterEach(() => {
      territoryApiServiceSpy.create.calls.reset();
      territoryApiServiceSpy.update.calls.reset();

      companyApiServiceSpy.fetchCompany.calls.reset();
    });

    it('should load empty form when new territory', async () => {
      // Arrange
      const fixture = TestBed.createComponent(TerritoryFormComponent);
      const comp = fixture.componentInstance;
      // Assert
      expect(comp).toBeTruthy();
      fixture.detectChanges();
      await fixture.whenStable().then(() => {
        expect(comp.territoryForm.get('address').get('street').value).toBeUndefined();
        expect(comp.territoryForm.get('address').get('city').value).toBeUndefined();
        expect(comp.territoryForm.get('address').get('postcode').value).toBeUndefined();
        expect(comp.territoryForm.get('company').get('siret').value).toEqual('');
        expect(comp.territoryForm.get('contacts').get('gdpr_dpo').get('email').value).toBeNull();
        expect(comp.territoryForm.get('contacts').get('gdpr_controller').get('email').value).toBeNull();
        expect(comp.territoryForm.get('contacts').get('technical').get('email').value).toBeNull();
      });
    });

    // TODO: merge scenario with previous test
    it('should create new territory with aom selector if siret form matches', async () => {
      // Arrange
      const fixture = TestBed.createComponent(TerritoryFormComponent);
      const comp = fixture.componentInstance;
      expect(comp).toBeTruthy();

      // Act
      // detect siret change
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 300)); // wait for throttleTime
      comp.territoryForm.controls.company.get('siret').setValue('24690062500012');
      comp.territoryForm.controls.contacts.get('gdpr_controller.email').setValue('gdpr_controller@mail.com');
      comp.territoryForm.controls.contacts.get('gdpr_controller.lastname').setValue('controller');
      comp.territoryForm.controls.contacts.get('gdpr_controller.firstname').setValue('gdpr');

      comp.territoryForm.controls.contacts.get('gdpr_dpo.email').setValue('gdpr_dpo@mail.com');
      comp.territoryForm.controls.contacts.get('gdpr_dpo.lastname').setValue('dpo');
      comp.territoryForm.controls.contacts.get('gdpr_dpo.firstname').setValue('gdpr');

      comp.territoryForm.controls.contacts.get('technical.email').setValue('technical@mail.com');
      comp.territoryForm.controls.contacts.get('technical.firstname').setValue('technical');
      comp.territoryForm.controls.contacts.get('technical.lastname').setValue('tech');
      fixture.detectChanges();

      await fixture.whenStable().then(() => {
        comp.onSubmit();

        // Assert
        expect(territoryApiServiceSpy.update).not.toHaveBeenCalled();
        expect(territoryApiServiceSpy.create).toHaveBeenCalled();
        expect(territoryApiServiceSpy.create).toHaveBeenCalledWith({
          name: "Communauté de communes du Pays de L'Arbresle",
          company_id: 4,
          contacts: {
            gdpr_dpo: {
              firstname: 'gdpr',
              lastname: 'dpo',
              email: 'gdpr_dpo@mail.com',
            },
            gdpr_controller: {
              firstname: 'gdpr',
              lastname: 'controller',
              email: 'gdpr_controller@mail.com',
            },
            technical: {
              firstname: 'technical',
              lastname: 'tech',
              email: 'technical@mail.com',
            },
          },
          address: {
            street: paysDeArbresleCompany.address_street,
            postcode: paysDeArbresleCompany.address_postcode,
            city: paysDeArbresleCompany.address_city,
            country: 'France',
          },
          selector: {
            aom: [paysDeArbresleCompany.siren],
          },
        });
      });
    });

    it('should create territory with epci selector if siret form matches', async () => {
      // Arrange
      territoryApiServiceSpy.findGeoBySiren.and.returnValue(of(toursMetropoleFindGeoBySirenResult));

      companyApiServiceSpy.fetchCompany.and.returnValue(of(toursMetropoleValeLoireCompany));

      const fixture = TestBed.createComponent(TerritoryFormComponent);
      const comp = fixture.componentInstance;
      expect(comp).toBeTruthy();

      // Act
      fixture.detectChanges();
      comp.territoryForm.controls.company.get('siret').setValue(toursMetropoleValeLoireCompany.siret);

      await fixture.whenStable().then(() => {
        comp.onSubmit();

        // Assert
        expect(territoryApiServiceSpy.update).not.toHaveBeenCalled();
        expect(territoryApiServiceSpy.create).toHaveBeenCalled();
        expect(territoryApiServiceSpy.create).toHaveBeenCalledWith({
          name: 'Tours Métropole Val de Loire',
          company_id: toursMetropoleValeLoireCompany._id,
          contacts: {},
          address: {
            street: toursMetropoleValeLoireCompany.address_street,
            postcode: toursMetropoleValeLoireCompany.address_postcode,
            cedex: toursMetropoleValeLoireCompany.address_cedex,
            city: toursMetropoleValeLoireCompany.address_city,
            country: 'France',
          },
          selector: {
            epci: [toursMetropoleValeLoireCompany.siren],
          },
        });
      });
    });
  });

  describe('Update', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TerritoryFormComponent],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [RouterTestingModule.withRoutes([])],
        providers: [
          FormBuilder,
          {
            provide: ActivatedRoute,
            useValue: {
              data: of({
                territory: {
                  ...territory,
                  _id: 4,
                },
              }),
            },
          },
          {
            provide: CompanyService,
            useValue: {
              getById(id: number): Observable<Partial<CompanyInterface>> {
                return of(paysDeArbresleCompany);
              },
              fetchCompany(siret: string): Observable<Partial<CompanyInterface>> {
                return of({
                  _id: 4,
                  ...paysDeArbresleCompany,
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
        ],
      }).compileComponents(),
    );

    afterEach(() => {
      territoryApiServiceSpy.create.calls.reset();
      territoryApiServiceSpy.update.calls.reset();
    });

    it('should load existing territory with company if exists', async () => {
      // Arrange
      const fixture = TestBed.createComponent(TerritoryFormComponent);
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      // Assert
      await fixture.whenStable().then(() => {
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

    // TODO : merge with previous scenario
    it('should load existing territory and update', async () => {
      // Arrange
      const fixture = TestBed.createComponent(TerritoryFormComponent);
      const comp = fixture.componentInstance;
      fixture.detectChanges();

      // Act
      comp.territoryForm.controls.contacts.get('gdpr_dpo.lastname').setValue('lastnameUpdate');

      // Assert
      await fixture.whenStable().then(() => {
        comp.onSubmit();

        // Assert
        expect(territoryApiServiceSpy.create).not.toHaveBeenCalled();
        expect(territoryApiServiceSpy.update).toHaveBeenCalled();
      });
    });
  });
});
