import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public passwordType = 'password';

  constructor(private fb: FormBuilder, private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  public get controls(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  public onLogin(): void {
    this.authService.login(this.controls.email.value, this.controls.password.value).subscribe((user) => {
      if (!user) {
        console.warn('login failed');
      }
    });
  }

  public onPasswordTypeToggle(): void {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }
}
