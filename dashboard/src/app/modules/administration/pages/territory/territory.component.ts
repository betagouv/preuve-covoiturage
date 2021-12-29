import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Roles } from '~/core/enums/user/roles';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { TerritoryInterface } from '../../../../../../../shared/territory/common/interfaces/TerritoryInterface';
import { CompanyV2 } from '../../../../core/entities/shared/companyV2';
import { CompanyService } from '../../../company/services/company.service';

@Component({
  selector: 'app-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.scss'],
})
export class TerritoryComponent extends DestroyObservable implements OnInit {
  public readOnly$: Observable<boolean>;
  public territory: TerritoryInterface;
  public company: CompanyV2;

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

    this.commonDataService.loadCurrentTerritory().subscribe((territory) => {
      this.territory = territory;
      this.companyService.getById(this.territory.company_id).subscribe((c) => {
        this.company = c;
      });
    });
  }
}
