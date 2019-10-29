import { Component, OnInit } from '@angular/core';

import { User } from '~/core/entities/authentication/user';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  user: User;

  constructor(public authService: AuthenticationService) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  get hasTerritoryGroup(): boolean {
    return this.authService.hasAnyGroup([UserGroupEnum.TERRITORY]);
  }
}
