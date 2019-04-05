import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { ModalResponse } from '~/entities/responses/modalResponse';

import { OperatorTokenService } from '../../services/operatorTokenService';


@Component({
  selector: 'app-token-creation',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})


export class TokenCreationComponent implements OnInit {
  public showTokenForm = false;
  public loading = false;
  public showModal = false;
  public newToken = '';
  public name = 'Serveur';

  @Output() return = new EventEmitter<ModalResponse>();


  constructor(private operatorTokenService: OperatorTokenService) {

  }

  ngOnInit() {
    // FIX: do nothing ?
  }

  // token generation
  public create(): void {
    this.loading = true;
    this.operatorTokenService.post({ name: this.name }).subscribe(
      (response) => {
        this.showModal = true;
        this.showTokenForm = false;
        this.loading = false;
        this.newToken = response['token'];
      },
      (error) => {
        this.showTokenForm = false;
        this.loading = false;
      },
    );
  }


  public closeModal() {
    this.showModal = false;
    this.return.emit();
  }
}
