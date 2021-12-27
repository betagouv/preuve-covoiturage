import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { TerritoryLevelEnum } from '../../../../../../../../../shared/territory/common/interfaces/TerritoryInterface';
import { User } from '../../../../../../core/entities/authentication/user';
import { Territory, TerritoryBase } from '../../../../../../core/entities/territory/territory';
import { Groups } from '../../../../../../core/enums/user/groups';
import { Roles } from '../../../../../../core/enums/user/roles';
import { AuthenticationService } from '../../../../../../core/services/authentication/authentication.service';
import { TerritoryApiService } from '../../../../services/territory-api.service';
import { TerritoryStoreService } from '../../../../services/territory-store.service';
import { TerritoryFormComponent } from './territory-form.component';

describe('TerritoryFormComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TerritoryFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: {} },
        { provide: TerritoryApiService, useValue: {} },
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

  it('should load empty form when new', () => {
    // Arrange
    const fixture = TestBed.createComponent(TerritoryFormComponent);
    const comp = fixture.componentInstance;
    // Assert
    expect(comp).toBeTruthy();
  });

  it('should load existing territory if exists', async () => {
    const fixture = TestBed.createComponent(TerritoryFormComponent);
    const comp = fixture.componentInstance;

    const baseTerritory: TerritoryBase = {
      _id: 1,
      name: "Communauté de communes du Pays de L'Arbresle",
      level: TerritoryLevelEnum.Towngroup,
      address: { street: '', postcode: '', city: '', country: 'France' },
      children: [66666, 66664],
    };
    const territory: Territory = new Territory(null);

    comp.territory = new Territory(territory.map(baseTerritory));
    console.debug(comp.territory);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(comp.territoryForm.get('name').value).toEqual("Communauté de communes du Pays de L'Arbresle");
    });
  });

  it('should submit form', () => {});
});
