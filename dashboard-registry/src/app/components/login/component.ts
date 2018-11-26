import { Component, OnInit} from '@angular/core';

import {ActivatedRoute, Params, Router} from '@angular/router';
import { AuthenticationService } from '../../common/applicativeService/authentication/service';
import {LoggerService} from '../../common/applicativeService/logger/service';
import {TokenService} from '../../common/applicativeService/token/service';
import {environment} from '../../../environments/environment';


@Component({
    templateUrl: 'template.html',
    styleUrls : ['style.scss']
})

export class LoginComponent implements OnInit {
    model: any = {};
    loading = false;
    error = '';


  constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private loggerService: LoggerService,

    ) { }
    ngOnInit() {
        // reset login status
        this.authenticationService.logout();
    }

    login() {
      this.loading = true;
      this.authenticationService.login(this.model.email, this.model.password)
        .subscribe(
                result => {
                  this.loading = false;
                  if ( result === true ) {
                    this.router.navigate(['/']);
                  }
              },
              error => {
                this.error = 'L\'email et/ou le mot de passe ne sont pas valide';
                this.loading = false;
              }
        );
    }


}