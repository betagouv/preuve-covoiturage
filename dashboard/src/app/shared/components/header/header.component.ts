import { Component, OnInit } from '@angular/core';

import { UserService } from '~/core/services/authentication/user.service';
import { User } from '~/core/entities/authentication/user';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  user: User;

  constructor(private userService: UserService, public authService: AuthenticationService) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
