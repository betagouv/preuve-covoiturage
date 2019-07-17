import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from './applicativeService/authentication/auth.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthenticationService) {}

  ngOnInit() {
    // check the token with the backend
    this.authService.checkToken();
  }
}
