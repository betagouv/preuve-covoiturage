import { Component, OnInit, Input } from '@angular/core';
// import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthenticationService } from '~/applicativeService/authentication/auth.service';
import { password } from '~/entities/validators';
import { User } from '~/entities/database/user/user';

@Component({
  selector: 'app-auth-form-new-password',
  templateUrl: 'template.html',
})
export class AuthFormNewPasswordComponent implements OnInit {
  public resetPasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(password.min), Validators.maxLength(password.max)]],
  });

  @Input() public token: string;
  @Input() public reset: string;
  public loading = false;
  submitted = false;

  constructor(private fb: FormBuilder, private router: Router, private authenticationService: AuthenticationService) {}

  ngOnInit(): void {}

  onSubmit() {
    const user = new User();
    Object.keys(this.resetPasswordForm.controls).forEach((prop) => {
      if (this.resetPasswordForm.controls[prop].dirty) {
        user[prop] = this.resetPasswordForm.value[prop];
      }
    });
    this.setNewPassword(user);
    this.submitted = true;
  }

  setNewPassword(user: User) {
    if (this.token) {
      this.loading = true;
      this.authenticationService.postNewPassword(this.reset, this.token, user.password).subscribe(
        () => {
          this.loading = false;
          this.router.navigate(['/signin'], { queryParams: { flash: 'password-changed' } });
        },
        () => {
          this.loading = false;
          // todo add error message
        },
      );
    }
  }
}
