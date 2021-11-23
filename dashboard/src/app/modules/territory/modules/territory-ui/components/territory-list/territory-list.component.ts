import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { Territory } from '~/core/entities/territory/territory';
import { Roles } from '~/core/enums/user/roles';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { TerritoryStoreService } from '~/modules/territory/services/territory-store.service';

@Component({
  selector: 'app-territory-list',
  templateUrl: './territory-list.component.html',
  styleUrls: ['./territory-list.component.scss'],
})
export class TerritoryListComponent extends DestroyObservable implements OnInit {
  public readonly displayedColumns: string[] = ['name'];

  @Input() territories: Territory[] = [];

  constructor(public authenticationService: AuthenticationService, public territoryStore: TerritoryStoreService) {
    super();
  }

  ngOnInit(): void {}
}
