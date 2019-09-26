import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { OperatorTokenInterface } from '~/core/interfaces/operator/operatorTokenInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { DialogService } from '~/core/services/dialog.service';

import { OperatorTokenService } from '../../../../services/operator-token.service';

@Component({
  selector: 'app-operator-token',
  templateUrl: './operator-token.component.html',
  styleUrls: ['./operator-token.component.scss'],
})
export class OperatorTokenComponent extends DestroyObservable implements OnInit {
  public operatorTokens: OperatorTokenInterface[];
  public showCreateTokenForm = false;

  constructor(
    public authenticationService: AuthenticationService,
    public operatorTokenService: OperatorTokenService,
    private _toastr: ToastrService,
    private _dialog: DialogService,
  ) {
    super();
  }

  ngOnInit() {
    this.loadOperatorTokens();
  }

  private loadOperatorTokens() {
    if (!this.operatorTokenService.loaded) {
      this.operatorTokenService
        .load()
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    this.operatorTokenService.operatorTokens$.pipe(takeUntil(this.destroy$)).subscribe((operatorTokens) => {
      this.operatorTokens = operatorTokens;
    });
  }

  public addToken() {
    this.showCreateTokenForm = true;
  }

  public closeTokenForm() {
    this.showCreateTokenForm = false;
  }

  public onDelete(operatorToken: OperatorTokenInterface) {
    const message = `Etes-vous sûr de vouloir supprimer le token d'accès : ${operatorToken.name} ?`;
    this._dialog
      .confirm('Suppression du token', message, 'Confirmer')
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.operatorTokenService
            .delete(operatorToken._id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              () => {
                this._toastr.success(`Le token d'accès : "${operatorToken.name} a été supprimé`);
              },
              (err) => {
                this._toastr.error(err.message);
              },
            );
        }
      });
  }
}
