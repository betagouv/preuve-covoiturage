import { Component, OnInit } from '@angular/core';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

  constructor(private _authService: AuthenticationService, private _commonDataService: CommonDataService) {
    super();
  }

  ngOnInit(): void {
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
