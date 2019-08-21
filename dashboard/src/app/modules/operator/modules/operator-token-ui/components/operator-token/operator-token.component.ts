import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { OperatorTokenInterface } from '~/core/interfaces/operator/operatorTokenInterface';

import { OperatorTokenService } from '../../../../services/operator-token.service';

@Component({
  selector: 'app-operator-token',
  templateUrl: './operator-token.component.html',
  styleUrls: ['./operator-token.component.scss'],
})
export class OperatorTokenComponent implements OnInit {
  public operatorTokens: OperatorTokenInterface[];
  public showCreateTokenForm = false;

  constructor(
    public authenticationService: AuthenticationService,
    public operatorTokenService: OperatorTokenService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.loadOperatorTokens();
  }

  private loadOperatorTokens() {
    this.operatorTokenService.load().subscribe(
      () => {},
      (err) => {
        // TODO TMP DELETE WHEN BACK IS LINKED
        const token1 = {
          _id: 'tokenId1',
          name: 'Application 1',
          createdAt: new Date('06/02/2018'),
        };
        const token2 = {
          _id: 'tokenId2',
          name: 'Application 2',
          createdAt: new Date('06/15/2018'),
        };
        const token3 = {
          _id: 'tokenId3',
          name: 'Application 3',
          createdAt: new Date('07/02/2018'),
        };
        this.operatorTokenService._entities$.next([token1, token2, token3]);
      },
    );
    this.operatorTokenService.operatorTokens$.subscribe((operatorTokens) => {
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
    this.operatorTokenService.delete(operatorToken).subscribe(
      () => {
        this.toastr.success(`Le token d'accès : "${operatorToken.name} a été supprimé`);
      },
      (err) => {
        this.toastr.error(err.message);
      },
    );
  }
}
