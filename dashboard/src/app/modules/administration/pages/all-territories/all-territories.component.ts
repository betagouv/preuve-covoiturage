import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { Territory } from '~/core/entities/territory/territory';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-all-territories',
  templateUrl: './all-territories.component.html',
  styleUrls: ['./all-territories.component.scss'],
})
export class AllTerritoriesComponent extends DestroyObservable implements OnInit {
  public editFormVisible = false;
  public editedEntity: Territory = null;

  constructor(public authenticationService: AuthenticationService, private fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {}

  onEdit(territory: Territory): void {}

  onDelete(territory: Territory): void {}

  closeForm(): void {
    throw new Error('not implemented');
  }

  showEditForm(): void {
    throw new Error('not implemented');
  }
}
