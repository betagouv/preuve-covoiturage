import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.component.html',
  styleUrls: ['./forgotten-password.component.scss'],
})
export class ForgottenPasswordComponent extends DestroyObservable implements OnInit {
  public forgottenPasswordForm: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    this.forgottenPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  sendEmail() {
    this.authService
      .sendForgottenPasswordEmail(this.forgottenPasswordForm.controls.email.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.router.navigate(['/login']).then(() => {
            this.toastr.success('Un lien de changement de mot de passe vous a été envoyé');
          });
        },
        (error) => {
          if ('message' in error) {
            this.toastr.error(error.message);
          } else {
            this.toastr.error('Une erreur est survenue');
          }
        },
      );
  }
}
