import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  ngOnInit() {
    this.initLoginForm();
  }

  public get controls() {
    return this.loginForm.controls;
  }

  public onLogin() {
    this.authService.login(this.controls.email.value, this.controls.password.value).subscribe((user) => {
      if (user === null) {
        console.log('login failed');
      } else {
        console.log('login success', user);
      }
    });
  }

  public onPasswordTypeToggle() {
    console.log('clicked');
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  /**
   * PRIVATE FUNCTIONS
   */
  private initLoginForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
}
