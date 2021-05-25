import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { User } from '~/core/entities/authentication/user';
import { UserApiService } from '~/modules/user/services/user-api.service';
import { ToastrService } from 'ngx-toastr';
import { Roles } from '~/core/enums/user/roles';
import { Groups } from '~/core/enums/user/groups';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnInit {
  public user = new User({
    // keepme to init values
    role: Roles.TerritoryUser,
    group: Groups.Territory,
  });

  constructor(
    private location: Location,
    private router: Router,
    private userApi: UserApiService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {}

  public onSubmit(user: User): void {
    this.userApi.create(user).subscribe(
      () => {
        this.toastr.success(
          `Un email a été envoyé à ${user.email}`,
          `L'utilisateur ${user.firstname} ${user.lastname} a été créé`,
        );
        this.router.navigate(['/admin/users'], { queryParams: { query: user.email } });
      },
      (err) => {
        this.toastr.error(
          `Erreur: ${err.message}`,
          `L'utilisateur ${user.firstname} ${user.lastname} n'a pu être créé`,
        );
      },
    );
  }

  public onReset(event?: Event): void {
    // TODO improve with app wide NavigationService
    // https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page
    if (window?.history?.length) this.location.back();
    else this.router.navigate(['/admin/users']);
  }
}
