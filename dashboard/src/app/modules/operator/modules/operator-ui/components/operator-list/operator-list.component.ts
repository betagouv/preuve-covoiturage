import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { OperatorsPermissionsAdminType } from '~/core/types/permissionType';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { OperatorService } from '~/modules/operator/services/operator.service';
import { Operator } from '~/core/entities/operator/operator';

@Component({
  selector: 'app-operator-list',
  templateUrl: './operator-list.component.html',
  styleUrls: ['./operator-list.component.scss'],
})
export class OperatorListComponent extends DestroyObservable implements OnInit, OnChanges {
  public operators: Operator[] = [];
  public operatorsToShow: Operator[] = [];
  public editPermission: OperatorsPermissionsAdminType = 'operator.update';

  @Input() filterLiteral = '';
  @Output() edit = new EventEmitter();

  constructor(private _operatorService: OperatorService, public authenticationService: AuthenticationService) {
    super();
  }

  ngOnInit() {
    console.log('init');
    this._operatorService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this._operatorService.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
      this.operators = operators;
      this.filter();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('filterLiteral' in changes) {
      this.filter();
    }
  }

  get operatorsloading(): boolean {
    return this._operatorService.loading;
  }

  get operatorsloaded(): boolean {
    return this._operatorService.operatorsLoaded;
  }

  filter() {
    this.operatorsToShow = this.operators.filter((t) =>
      t.nom_commercial.toLowerCase().includes(this.filterLiteral.toLowerCase()),
    );
  }

  onEdit(operator) {
    // todo: subscribe to loading of entity ?
    setTimeout(() => {
      document.getElementById('operatorForm-anchor').scrollIntoView({
        behavior: 'smooth',
      });
    }, 200);
    this.edit.emit(operator);
  }
}
