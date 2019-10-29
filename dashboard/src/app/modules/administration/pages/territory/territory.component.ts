import { Component, OnInit } from '@angular/core';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { OperatorService } from '~/modules/operator/services/operator.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { Territory } from '~/core/entities/territory/territory';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.scss'],
})
export class TerritoryComponent extends DestroyObservable implements OnInit {
  public readOnly$: Observable<boolean>;
  public territory: Territory;

  constructor(
    private _operatorService: OperatorService,
    private _authService: AuthenticationService,
    private _commonDataService: CommonDataService,
  ) {
    super();
  }

  ngOnInit() {
    this.readOnly$ = this._authService.user$.pipe(
      takeUntil(this.destroy$),
      map((user) => user && !this._authService.hasAnyPermission(['territory.update'])),
    );

    this._commonDataService.currentTerritory$
      .pipe(
        takeUntil(this.destroy$),
        tap((t) => console.log('t : ', t)),
      )
      .subscribe((territory) => (this.territory = territory));
  }
}
