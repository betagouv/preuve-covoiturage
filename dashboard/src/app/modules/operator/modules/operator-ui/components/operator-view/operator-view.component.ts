import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { OperatorService } from '~/modules/operator/services/operator.service';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-operator-view',
  templateUrl: './operator-view.component.html',
  styleUrls: ['./operator-view.component.scss'],
})
export class OperatorViewComponent extends DestroyObservable implements OnInit {
  constructor(private _operatorService: OperatorService) {
    super();
  }

  ngOnInit() {
    this._operatorService
      .loadConnectedOperator()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
