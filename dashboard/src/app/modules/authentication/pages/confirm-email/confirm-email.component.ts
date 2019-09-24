import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { URLS } from '~/core/const/main.const';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
})
export class ConfirmEmailComponent extends DestroyObservable implements OnInit {
  public hasError = false;
  public isSuccess = false;
  public contactEmail = URLS.contactEmail;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService,
    private toastr: ToastrService,
    private router: Router,
  ) {
    super();
  }

  ngOnInit() {
    this.confirmEmail();
  }

  confirmEmail(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: Params) => {
      const confirm = params.get('email');
      const token = params.get('token');

      this.authService
        .confirmEmail(confirm, token)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          () => {
            // this.isSuccess = true;
            // setTimeout(() => ), 3000);

            this.router.navigate(['/login']).then(() => {
              this.toastr.success('Vous pouvez vous connecter à votre compte', 'Email confirmé');
            });
          },
          (error) => {
            this.hasError = true;
            this.toastr.error('Email non confirmé');
          },
        );
    });
  }
}
