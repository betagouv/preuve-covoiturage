import { Component, OnInit } from '@angular/core';

import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-territory-view',
  templateUrl: './territory-view.component.html',
  styleUrls: ['./territory-view.component.scss'],
})
export class TerritoryViewComponent extends DestroyObservable implements OnInit {
  constructor() {
    super();
  }

  ngOnInit() {}
}
