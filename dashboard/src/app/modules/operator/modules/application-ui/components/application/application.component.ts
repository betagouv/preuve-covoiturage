import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { map, takeUntil } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { DialogService } from '~/core/services/dialog.service';
import { ApplicationStoreService } from '~/modules/operator/services/application-store.service';
import { Application } from '~/core/entities/operator/application';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
})
export class ApplicationComponent extends DestroyObservable implements OnInit {
  public applications: Application[];
  public showCreateApplicationForm = false;

  constructor(
    private _authService: AuthenticationService,
    private _applicationStoreService: ApplicationStoreService,
    private _toastr: ToastrService,
    private _dialog: DialogService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadOperatorTokens();
  }

  private loadOperatorTokens(): void {
    const operatorId = this._authService.user.operator_id;
    this._applicationStoreService.filterSubject.next({ owner_id: operatorId });

    this._applicationStoreService.entities$
      .pipe(
        map((applications) => applications.sort((a, b) => a.name.localeCompare(b.name))),
        takeUntil(this.destroy$),
      )
      .subscribe((applications) => {
        this.applications = applications;
      });

    this._applicationStoreService.loadList();
  }

  public addToken(): void {
    this.showCreateApplicationForm = true;
  }

  public closeTokenForm(): void {
    this.showCreateApplicationForm = false;
  }

  public get canRevoke(): boolean {
    return this._authService.hasAnyPermission(['application.revoke']);
  }

  public get canCreate(): boolean {
    return this._authService.hasAnyPermission(['application.create']);
  }

  public get loading(): boolean {
    return this._applicationStoreService.isLoading;
  }

  public onDelete(application: Application): void {
    const title = `Etes-vous sûr de vouloir supprimer l'application : ${application.name} ?`;
    this._dialog
      .confirm({
        title,
        confirmBtn: 'Confirmer',
        cancelBtn: 'Annuler',
        color: 'warn',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this._applicationStoreService
            .revokeAndList(application)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (data) => {
                this._toastr.success(`Le token d'accès "${application.name}" a été supprimé`);
              },
              (err) => {
                this._toastr.error(err.message);
              },
            );
        }
      });
  }
}
