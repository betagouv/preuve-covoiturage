import { takeUntil } from 'rxjs/operators';

import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends DestroyObservable implements OnInit {
  public loginForm: FormGroup;
  public passwordType = 'password';

  constructor(private fb: FormBuilder, private authService: AuthenticationService, private router: Router) {
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
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  public onPasswordTypeToggle(): void {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }
}
