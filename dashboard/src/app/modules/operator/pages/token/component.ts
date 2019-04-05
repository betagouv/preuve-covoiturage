import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

import { HEADERS } from '~/config/headers';
import { TranslationService } from '~/services/translationService';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { Token } from '~/entities/database/token';
import { ApiResponse } from '~/entities/responses/apiResponse';

import { OperatorTokenService } from '../../services/operatorTokenService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class TokenComponent implements OnInit {
  public tokens: any = [];
  public headList: string[] = HEADERS.tokens.main;
  public name = 'Serveur';
  public loading = true;

  constructor(private operatorTokenService: OperatorTokenService,
              private translationService: TranslationService,
              private authentificationService: AuthenticationService,
              private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
    this.get();
  }

  public get() {
    this.operatorTokenService.get().subscribe((response: ApiResponse) => {
      this.loading = false;
      this.tokens = response.data;
    });
  }

  public delete(token: Token) {
    const id = token._id;
    const name = token.name;

    this.confirmationService.confirm({
      message: `Etes vous sûr de vouloir supprimer le token du serveur ${name} ?`,
      accept: () => {
        this.operatorTokenService.delete(id).subscribe(
          () => {
            this.get();
          },
        );
      },
    });
  }

  public hasPermission(permission: string): boolean {
    return this.authentificationService.hasPermission(permission);
  }

  public getValue(token: object, key: string): string {
    return this.translationService.getTableValue(token, key);
  }

  public getKey(key: string): string {
    return this.translationService.getTableKey(key);
  }
}
