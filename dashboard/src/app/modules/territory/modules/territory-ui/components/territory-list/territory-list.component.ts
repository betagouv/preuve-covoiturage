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
  public readonly displayedColumns: string[] = ['name', 'actions'];

  @Input() territories: Territory[] = [];
  @Output() edit = new EventEmitter();

  get canEdit(): boolean {
    return this.authenticationService.hasRole([Roles.RegistryAdmin]);
  }

  constructor(public authenticationService: AuthenticationService, public territoryStore: TerritoryStoreService) {
    super();
  }

  ngOnInit(): void {}

  onEdit(territory: Territory): void {
    this.edit.emit(territory);
  }
}
