import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { takeUntil } from 'rxjs/operators';

import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-change-auth-layout',
  templateUrl: './change-auth-layout.component.html',
  styleUrls: ['./change-auth-layout.component.scss'],
})
export class ChangeAuthLayoutComponent extends DestroyObservable implements OnInit {
  imgSrc: string;

  constructor(private _router: Router) {
    super();
  }

  ngOnInit() {
    this.setImgSrc(this._router.url);
    this._router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.setImgSrc(this._router.url);
    });
  }

  private setImgSrc(url: string): void {
    if (url.includes('/forgotten-password')) {
      this.imgSrc = 'assets/img/forgotten_password.svg';
      return;
    }
    this.imgSrc = null;
    return;
  }
}
