import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {
  constructor(
    private router: Router,
    public authService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.authService
      .logout()
      .pipe(delay(1000))
      .subscribe(() => {
        this.router.navigate(['/login']);
      });
  }
}
