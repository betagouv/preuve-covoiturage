import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { map, takeUntil, tap } from 'rxjs/operators';

import { OperatorService } from '~/modules/operator/services/operator.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { Operator } from '~/core/entities/operator/operator';
import { CommonDataService } from '~/core/services/common-data.service';

@Component({
  selector: 'app-operator-view',
  templateUrl: './operator-view.component.html',
  styleUrls: ['./operator-view.component.scss'],
})
export class OperatorViewComponent extends DestroyObservable implements OnInit {
  public readOnly$: Observable<boolean>;
  operator: Operator;

  constructor(
    private _operatorService: OperatorService,
    private _authService: AuthenticationService,
    private _commonDataService: CommonDataService,
  ) {
    super();
  }

  ngOnInit() {
    // this._operatorService
    //   .loadConnectedOperator()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe();

    // readonly apply only for non admin user
    this.readOnly$ = this._authService.user$.pipe(
      map((user) => user && !this._authService.hasAnyPermission(['operator.update'])),
      tap((ro) => console.log('ro : ', ro)),
    );

    this.readOnly$.subscribe();

    this._commonDataService.currentOperator$
      .pipe(takeUntil(this.destroy$))
      .subscribe((operator) => (this.operator = operator));
  }
}
