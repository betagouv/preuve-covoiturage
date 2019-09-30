import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { OperatorTokenInterface } from '~/core/interfaces/operator/operatorTokenInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';

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
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    this.loadOperatorTokens();
  }

  private loadOperatorTokens() {
    this.operatorTokenService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
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
    this.operatorTokenService.delete(operatorToken._id).subscribe(
      () => {
        this.toastr.success(`Le token d'accès : "${operatorToken.name} a été supprimé`);
      },
      (err) => {
        this.toastr.error(err.message);
      },
    );
  }
}
