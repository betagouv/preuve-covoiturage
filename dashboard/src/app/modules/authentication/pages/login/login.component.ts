import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JsonRPCService } from '../../../../core/services/api/json-rpc.service';
import { AuthenticationService } from '../../../../core/services/authentication/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;

  constructor(private fb: FormBuilder, private jsonRPC: JsonRPCService, private authService: AuthenticationService) {}

  ngOnInit() {
    this.initLoginForm();
  }

  get controls() {
    return this.loginForm.controls;
  }

  onLogin() {
    console.log(this.loginForm.getRawValue());
    this.authService.login(this.controls.email.value, this.controls.password.value);
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
