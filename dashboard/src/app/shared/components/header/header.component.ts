import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../core/services/authentication/user.service';
import {User} from '../../../core/entities/authentication/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  user: User;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userService.user$.subscribe(user => {
      this.user = user;
    });
  }
}
