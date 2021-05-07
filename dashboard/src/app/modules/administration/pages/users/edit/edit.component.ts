import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { switchMap, takeUntil } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { User } from '~/core/entities/authentication/user';
import { UserApiService } from '~/modules/user/services/user-api.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Roles } from '~/core/enums/user/roles';
import { Groups } from '~/core/enums/user/groups';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent extends DestroyObservable implements OnInit {
  public user: User | null = null;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private userApi: UserApiService,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params: ParamMap) => {
          const id = parseInt(params.get('id') || '', 10);
          if (!id) return throwError(`Bad id: ${id}`);
          return this.userApi.getById(id);
        }),
      )
      .subscribe((user: User) => {
        this.user = new User(user);
      });
  }

  public onSubmit(user: User): void {
    const { _id, email, firstname, lastname, phone, role } = user;
    this.userApi.patch(_id, { email, firstname, lastname, phone, role }).subscribe(
      () => {
        this.toastr.success(`${user.firstname} ${user.lastname} a été mis à jour`);
        this.router.navigate(['/admin/users'], { queryParams: { query: user.email } });
      },
      (err) => {
        this.toastr.error(`Erreur: ${err.message}`);
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
