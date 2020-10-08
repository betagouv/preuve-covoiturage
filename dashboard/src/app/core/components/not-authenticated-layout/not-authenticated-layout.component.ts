import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-not-authenticated-layout',
  templateUrl: './not-authenticated-layout.component.html',
  styleUrls: ['./not-authenticated-layout.component.scss'],
})
export class NotAuthenticatedLayoutComponent implements OnInit {
  constructor(private authService: AuthenticationService, private router: Router) {}

  ngOnInit(): void {}
}
