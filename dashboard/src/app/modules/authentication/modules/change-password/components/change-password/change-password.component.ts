import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { password } from '~/core/config/validators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  public changePasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private authentication: AuthenticationService) {}

  ngOnInit(): void {
    this.initProfilForm();
  }

  get controls() {
    return this.changePasswordForm.controls;
  }
  onChangePassword(): void {
    this.authentication.changePassword(
      this.changePasswordForm.value.oldPassword,
      this.changePasswordForm.value.newPassword,
    );
  }

  private initProfilForm(): void {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(password.min), Validators.maxLength(password.max)]],
      newPassword: ['', [Validators.required, Validators.minLength(password.min), Validators.maxLength(password.max)]],
    });
  }
}
