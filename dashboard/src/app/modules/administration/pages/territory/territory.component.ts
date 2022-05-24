import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Roles } from '~/core/enums/user/roles';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { TerritoryInterface } from '~/shared/territory/common/interfaces/TerritoryInterface';
import { ResultInterface as CompanyInterface } from '~/shared/company/find.contract';
import { CompanyService } from '../../../company/services/company.service';

@Component({
  selector: 'app-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.scss'],
})
export class TerritoryComponent extends DestroyObservable implements OnInit {
  public readOnly$: Observable<boolean>;
  public territory: TerritoryInterface;
  public company: CompanyInterface;

  constructor(
    private auth: AuthenticationService,
    private commonDataService: CommonDataService,
    private companyService: CompanyService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.readOnly$ = this.auth.user$.pipe(
      takeUntil(this.destroy$),
      map((user) => user && !this.auth.hasRole([Roles.TerritoryAdmin, Roles.TerritoryDemo, Roles.RegistryAdmin])),
    );

    this.commonDataService
      .loadCurrentTerritory()
      .pipe(
        takeUntil(this.destroy$),
        tap((territory) => (this.territory = territory)),
        mergeMap((territory) => this.companyService.getById(territory.company_id)),
        tap((company) => (this.company = company)),
      )
      .subscribe();
  }
}
