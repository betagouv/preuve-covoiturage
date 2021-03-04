import { Component, OnInit } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { Operator } from '~/core/entities/operator/operator';
import { Roles } from '~/core/enums/user/roles';

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.scss'],
})
export class OperatorComponent extends DestroyObservable implements OnInit {
  public readOnly$: Observable<boolean>;
  operator: Operator;

  constructor(private auth: AuthenticationService, private commonData: CommonDataService) {
    super();
  }

  ngOnInit(): void {
    // readonly apply only for non admin user
    this.readOnly$ = this.auth.user$.pipe(
      takeUntil(this.destroy$),
      map((user) => user && !this.auth.hasRole([Roles.OperatorAdmin, Roles.RegistryAdmin])),
    );

    this.commonData.currentOperator$.pipe(takeUntil(this.destroy$)).subscribe((operator) => (this.operator = operator));
  }
}
