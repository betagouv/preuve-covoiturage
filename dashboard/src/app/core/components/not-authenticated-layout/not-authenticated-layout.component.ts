import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/authentication/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-authenticated-layout',
  templateUrl: './not-authenticated-layout.component.html',
  styleUrls: ['./not-authenticated-layout.component.scss'],
})
export class NotAuthenticatedLayoutComponent implements OnInit {
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    // Si on est logué, on s'en va de ce layout
    this.userService.user$.subscribe((user) => {
      console.log('USER', user);
      if (user) {
        this.router.navigate(['/ui-guide']);
      }
    });
  }
}
