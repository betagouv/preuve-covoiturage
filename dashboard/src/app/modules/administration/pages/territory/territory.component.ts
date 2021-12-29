import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Roles } from '~/core/enums/user/roles';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { TerritoryInterface } from '../../../../../../../shared/territory/common/interfaces/TerritoryInterface';

@Component({
  selector: 'app-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.scss'],
})
export class TerritoryComponent extends DestroyObservable implements OnInit {
  public readOnly$: Observable<boolean>;
  public territory: TerritoryInterface;

  constructor(private auth: AuthenticationService, private commonData: CommonDataService) {
    super();
  }

  ngOnInit(): void {
    this.readOnly$ = this.auth.user$.pipe(
      takeUntil(this.destroy$),
      map((user) => user && !this.auth.hasRole([Roles.TerritoryAdmin, Roles.TerritoryDemo, Roles.RegistryAdmin])),
    );

    this.commonData.currentTerritory$
      .pipe(takeUntil(this.destroy$))
      .subscribe((territory) => (this.territory = territory));
  }
}
