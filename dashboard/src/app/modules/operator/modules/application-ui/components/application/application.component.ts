import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { ApplicationInterface } from '~/core/interfaces/operator/applicationInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { DialogService } from '~/core/services/dialog.service';

import { ApplicationService } from '../../../../services/application.service';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
})
export class ApplicationComponent extends DestroyObservable implements OnInit {
  public applications: ApplicationInterface[];
  public showCreateApplicationForm = false;

  constructor(
    public authenticationService: AuthenticationService,
    public applicationService: ApplicationService,
    private _toastr: ToastrService,
    private _dialog: DialogService,
  ) {
    super();
  }

  ngOnInit() {
    this.loadOperatorTokens();
  }

  private loadOperatorTokens() {
    if (!this.applicationService.loaded) {
      this.applicationService
        .load()
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    this.applicationService.application$.pipe(takeUntil(this.destroy$)).subscribe((applications) => {
      this.applications = applications;
    });
  }

  public addToken() {
    this.showCreateApplicationForm = true;
  }

  public closeTokenForm() {
    this.showCreateApplicationForm = false;
  }

  public onDelete(application: ApplicationInterface) {
    const message = `Etes-vous sûr de vouloir supprimer l'application : ${application.name} ?`;
    this._dialog
      .confirm("Suppression de l'application", message, 'Confirmer')
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.applicationService
            .revokeAndList(application._id)
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
