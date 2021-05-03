import { throwError } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends DestroyObservable implements OnInit {
  public loginForm: FormGroup;
  public passwordType = 'password';

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private toaster: ToastrService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  public onLogin(): void {
    const { email, password } = this.loginForm.value;

    this.authService
      .login(email, password)
      .pipe(
        takeUntil(this.destroy$),
        catchHttpStatus(403, (e) => {
          this.toaster.error('Mauvais email ou mot de passe', 'Erreur de connexion');
          return throwError(e);
        }),
      )
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  public onPasswordTypeToggle(): void {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }
}
