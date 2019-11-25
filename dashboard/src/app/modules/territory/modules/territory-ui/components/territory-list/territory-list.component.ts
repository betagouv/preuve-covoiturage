import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { Territory } from '~/core/entities/territory/territory';
import { TerritoriesPermissionsAdminType } from '~/core/types/permissionType';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { TerritoryStoreService } from '~/modules/territory/services/territoryStore.service';

@Component({
  selector: 'app-territory-list',
  templateUrl: './territory-list.component.html',
  styleUrls: ['./territory-list.component.scss'],
})
export class TerritoryListComponent extends DestroyObservable implements OnInit {
  public editPermission: TerritoriesPermissionsAdminType = 'territory.update';

  displayedColumns: string[] = ['name', 'actions'];

  @Input() territories: Territory[];
  @Output() edit = new EventEmitter();

  constructor(public authenticationService: AuthenticationService, public territoryStore: TerritoryStoreService) {
    super();
  }

  ngOnInit() {}

  onEdit(territory: Territory) {
    this.edit.emit(territory);
  }
}
