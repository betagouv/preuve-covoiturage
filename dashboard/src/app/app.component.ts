import { Component, OnInit } from '@angular/core';

import { DestroyObservable } from './core/components/destroy-observable';
import { IconService } from './core/services/icon.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends DestroyObservable implements OnInit {
  title = 'registre de preuve de covoiturage';

  constructor(private iconService: IconService) {
    super();
  }

  ngOnInit(): void {
    this.iconService.init();
  }
}
