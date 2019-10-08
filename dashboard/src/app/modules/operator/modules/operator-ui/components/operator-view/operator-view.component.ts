import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';

import { OperatorService } from '~/modules/operator/services/operator.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-operator-view',
  templateUrl: './operator-view.component.html',
  styleUrls: ['./operator-view.component.scss'],
})
export class OperatorViewComponent extends DestroyObservable implements OnInit {
  public readOnly$: Observable<boolean>;

  constructor(private _operatorService: OperatorService, private _authService: AuthenticationService) {
    super();
  }

  ngOnInit() {
    this._operatorService
      .loadConnectedOperator()
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // readonly apply only for non admin user
    this.readOnly$ = this._authService.user$.pipe(
      map((user) => this._authService.hasAnyPermission(['operator.update'])),
    );
  }
}
