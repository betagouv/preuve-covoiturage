import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../../services/authentication/user.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-not-authenticated-layout',
  templateUrl: './not-authenticated-layout.component.html',
  styleUrls: ['./not-authenticated-layout.component.scss'],
})
export class NotAuthenticatedLayoutComponent implements OnInit {
  constructor(private authService: AuthenticationService, private router: Router) {}

  ngOnInit() {
    // Si on est logué, on s'en va de ce layout
    // this.authService.user$.subscribe((user) => {
    //   console.log('USER', user);
    //   if (user) {
    //     this.router.navigate(['/trip/stats']);
    //   }
    // });
  }
}
