import { Component, OnInit } from '@angular/core';

import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-operator',
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.scss'],
})
export class OperatorComponent extends DestroyObservable implements OnInit {
  constructor() {
    super();
  }

  ngOnInit() {}
}
