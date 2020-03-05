import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';

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

  ngOnInit(): void {
    this.forgottenPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  sendEmail(): void {
    this.authService
      .sendForgottenPasswordEmail(this.forgottenPasswordForm.controls.email.value)
      .pipe(
        takeUntil(this.destroy$),
        catchHttpStatus(404, (err) => {
          this.toastr.error("Cette adresse Email n'est pas valide");
          throw err;
        }),
      )
      .subscribe(
        (data) => {
          this.router.navigate(['/login']).then(() => {
            this.toastr.success('Un lien de changement de mot de passe vous a été envoyé');
          });
        },
        (err) => console.error(err),
      );
  }
}
