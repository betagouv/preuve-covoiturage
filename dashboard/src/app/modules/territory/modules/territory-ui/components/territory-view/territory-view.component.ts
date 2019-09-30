import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { TerritoryService } from '~/modules/territory/services/territory.service';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-territory-view',
  templateUrl: './territory-view.component.html',
  styleUrls: ['./territory-view.component.scss'],
})
export class TerritoryViewComponent extends DestroyObservable implements OnInit {
  constructor(private _territoryService: TerritoryService) {
    super();
  }

  ngOnInit() {
    this._territoryService
      .loadConnectedTerritory()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
