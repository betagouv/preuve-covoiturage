import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { PASSWORD } from '~/core/const/validators.const';

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
      oldPassword: ['', [Validators.required, Validators.minLength(PASSWORD.min), Validators.maxLength(PASSWORD.max)]],
      newPassword: ['', [Validators.required, Validators.minLength(PASSWORD.min), Validators.maxLength(PASSWORD.max)]],
    });
  }
}
