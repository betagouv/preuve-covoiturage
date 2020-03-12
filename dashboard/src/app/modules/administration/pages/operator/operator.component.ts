import { Component, OnInit } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { Operator } from '~/core/entities/operator/operator';

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.scss'],
})
export class OperatorComponent extends DestroyObservable implements OnInit {
  public readOnly$: Observable<boolean>;
  operator: Operator;

  constructor(private _authService: AuthenticationService, private _commonDataService: CommonDataService) {
    super();
  }

  ngOnInit(): void {
    // readonly apply only for non admin user
    this.readOnly$ = this._authService.user$.pipe(
      takeUntil(this.destroy$),
      map((user) => user && !this._authService.hasAnyPermission(['operator.update'])),
    );

    this._commonDataService.currentOperator$
      .pipe(takeUntil(this.destroy$))
      .subscribe((operator) => (this.operator = operator));
  }
}
