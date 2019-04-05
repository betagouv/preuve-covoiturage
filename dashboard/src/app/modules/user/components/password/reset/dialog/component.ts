import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { InputBase } from '~/entities/form/inputBase';
import { InputGroup } from '~/entities/form/inputGroup';
import { ModalResponse } from '~/entities/responses/modalResponse';
import { PasswordInputBase } from '~/entities/form/passwordInputBase';

import { ProfileService } from './../../../../services/profileService';


@Component({
  selector: 'app-pwd-reset-dialog',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class PasswordResetDialogComponent implements OnInit {
  public password;
  public newPassword;
  public loading = false;
  public title = 'Créer un nouveau mot de passe';

  public inputs: InputBase<any>[] = [];
  public inputGroups: InputGroup<any>[] = [];
  @Input() showModal = false;
  @Output() answer = new EventEmitter<ModalResponse>();

  constructor(
      private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    this.inputs = [
      new PasswordInputBase({
        key: 'password',
        label: 'Mot de passe actuel',
        placeholder: 'Entrez votre mot de passe ici',
        value: null,
        required: true,
      }),

      new PasswordInputBase({
        key: 'newPassword',
        label: 'Nouveau mot de passe',
        placeholder: 'Entrez votre nouveau mot de passe ici',
        value: null,
        required: true,
      }),

    ];

    this.inputGroups = [
      new InputGroup({
        key: 'main',
        inputs: this.inputs,
      }),
    ];
  }


  public closeModal() {
    this.showModal = false;
    this.answer.emit(new ModalResponse());
  }

  public postPassword(passwords) {
    this.loading = true;
    this.profileService.postPassword(passwords).subscribe(
      (response) => {
        this.loading = false;
        this.showModal = false;
        this.answer.emit(new ModalResponse());
      },
      (error) => {
        this.loading = false;
      },
    );
  }
}
