import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { TerritoryInterface, TerritoryLevelEnum } from '~/shared/territory/common/interfaces/TerritoryInterface';
import { User } from '../../../../../../core/entities/authentication/user';
import { ResultInterface as CompanyInterface } from '~/shared/company/find.contract';
import { Groups } from '../../../../../../core/enums/user/groups';
import { Roles } from '../../../../../../core/enums/user/roles';
import { AuthenticationService } from '../../../../../../core/services/authentication/authentication.service';
import { CompanyService } from '../../../../../company/services/company.service';
import { TerritoryApiService } from '../../../../services/territory-api.service';
import { TerritoryFormComponent } from './territory-form.component';

describe('TerritoryFormComponent', () => {
  const company = {
    siret: '24690062500012',
    siren: null,
    legal_name: 'COMMUNAUTE COMMUNES PAYS DE L ARBRESLE',
    company_naf_code: '8411Z',
    intra_vat: 'FR90246900625',
    address_street: '117 RUE PIERRE PASSEMARD',
    address_city: "L'ARBRESLE",
    address_postcode: '69210',
  };

  const territory: TerritoryInterface = {
    _id: 44,
    level: TerritoryLevelEnum.Towngroup,
    name: "Communauté de communes du Pays de L'Arbresle",
    company_id: 3,
    children: [1, 2],
    parent: 5,
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
      street: '',
      postcode: '',
      city: '',
      country: '',
    },
  };

  const territoryApiServiceSpy = jasmine.createSpyObj<TerritoryApiService>('TerritoryApiService', {
    create: of(territory),
    update: of(territory),
    findGeoBySiren: of({
      aom_siret: '200052264',
      aom_name: 'Grand Est',
      epci_name: 'CC Ardennes Thiérache',
      epci_siret: '200041622',
      coms: [
        { insee: '08015', name: 'Antheny', _id: null },
        { insee: '08182', name: 'Le Fréty', _id: null },
        { insee: '08167', name: 'La Férée', _id: null },
      ],
    }),
  });

  describe('Create', () => {
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
              data: new Observable(),
            },
          },
          {
            provide: CompanyService,
            useValue: {
              getById(id: number): Observable<Partial<CompanyInterface>> {
                return of(company);
              },
              fetchCompany(siret: string): Observable<Partial<CompanyInterface>> {
                return of({
                  _id: 4,
                  ...company,
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
        expect(comp.territoryForm.get('contacts').get('gdpr_dpo').get('email').value).toBeNull();
        expect(comp.territoryForm.get('contacts').get('gdpr_controller').get('email').value).toBeNull();
        expect(comp.territoryForm.get('contacts').get('technical').get('email').value).toBeNull();
      });
    });

    // TODO: merge scenario with previous test
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
            street: company.address_street,
            postcode: company.address_postcode,
            city: company.address_city,
            country: 'France',
          },
          selector: {
            _id: [1, 2],
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
                return of(company);
              },
              fetchCompany(siret: string): Observable<Partial<CompanyInterface>> {
                return of({
                  _id: 4,
                  ...company,
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
      await new Promise((resolve) => setTimeout(resolve, 300)); // wait for throttleTime
      fixture.detectChanges();

      // Assert
      await fixture.whenStable().then(() => {
        expect(comp.territoryForm.get('name').value).toEqual(territory.name);

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
      comp.territoryForm.controls.inseeString.setValue('69010,69021');

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
