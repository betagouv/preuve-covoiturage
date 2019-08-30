import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { URLS } from '~/core/const/main.const';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
})
export class ConfirmEmailComponent implements OnInit {
  public hasError = false;
  public isSuccess = false;
  public contactEmail = URLS.contactEmail;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.confirmEmail();
  }

  confirmEmail(): void {
    this.activatedRoute.paramMap.subscribe((params: Params) => {
      const confirm = params.get('confirm');
      const token = params.get('token');

      this.authService.checkEmailToken(confirm, token).subscribe(
        () => {
          this.isSuccess = true;
          this.toastr.success('Vous pouvez créer votre mot de passe', 'Email confirmé');
        },
        (error) => {
          this.hasError = true;
          this.toastr.error('Email non confirmé');
        },
      );
    });
  }
}
