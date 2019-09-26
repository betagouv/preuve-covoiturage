import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { TerritoryService } from '~/modules/territory/services/territory.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Territory } from '~/core/entities/territory/territory';
import { TerritoriesPermissionsAdminType } from '~/core/types/permissionType';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-territory-list',
  templateUrl: './territory-list.component.html',
  styleUrls: ['./territory-list.component.scss'],
})
export class TerritoryListComponent extends DestroyObservable implements OnInit, OnChanges {
  public territories: Territory[] = [];
  public territoriesToShow: Territory[] = [];
  public editPermission: TerritoriesPermissionsAdminType = 'territory.update';

  @Input() filterLiteral = '';
  @Output() edit = new EventEmitter();

  constructor(private _territoryService: TerritoryService, public authenticationService: AuthenticationService) {
    super();
  }

  ngOnInit() {
    this._territoryService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this._territoryService.territories$.pipe(takeUntil(this.destroy$)).subscribe((territories) => {
      this.territories = territories;
      this.filter();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('filterLiteral' in changes) {
      this.filter();
    }
  }

  get territoriesloading(): boolean {
    return this._territoryService.loading;
  }

  get territoriesloaded(): boolean {
    return this._territoryService.territoriesLoaded;
  }

  filter() {
    console.log(this.filterLiteral);
    this.territoriesToShow = this.territories.filter((t) => t.name.toLowerCase().includes(this.filterLiteral));
  }

  onEdit(id: string) {
    this.edit.emit(id);
  }
}
