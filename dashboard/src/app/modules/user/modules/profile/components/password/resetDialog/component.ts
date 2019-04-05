import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { DynamicDialogRef } from 'primeng/api';

import { password } from '~/entities/validators';

import { ProfileService } from '../../../../../services/profileService';


@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class PasswordResetDialogComponent implements OnInit {
  public loading = false;

  public newPassordForm;
  constructor(
      private profileService: ProfileService,
      public ref: DynamicDialogRef,
      private fb: FormBuilder,
  ) {
    this.newPassordForm = this.fb.group({
      password: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(password.min), Validators.maxLength(password.max)]],
    });
  }

  ngOnInit() {
  //
  }


  onSubmit() {
    if (this.newPassordForm.controls['password'].dirty && this.newPassordForm.controls['newPassword'].dirty) {
      this.postPassword({
        password: this.newPassordForm.value.password,
        newPassword: this.newPassordForm.value.newPassword,
      });
    }
  }

  public postPassword(passwords) {
    this.loading = true;
    this.profileService.postPassword(passwords).subscribe(
      (response) => {
        this.loading = false;
        this.ref.close();
      },
      (error) => {
        this.loading = false;
        this.ref.close();
      },
    );
  }
}
