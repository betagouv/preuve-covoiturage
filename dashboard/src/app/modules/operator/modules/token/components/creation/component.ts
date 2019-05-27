import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DynamicDialogRef } from 'primeng/api';
import { FormBuilder, Validators } from '@angular/forms';

import { ModalResponse } from '~/entities/responses/modalResponse';

import { OperatorTokenService } from '../../../../services/operatorTokenService';

@Component({
  selector: 'app-token-creation',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class OperatorTokenCreationDialogComponent implements OnInit {
  constructor(
    private operatorTokenService: OperatorTokenService,
    public ref: DynamicDialogRef,
    private fb: FormBuilder,
  ) {}

  public tokenForm = this.fb.group({
    name: ['', Validators.required],
  });

  showTokenForm = false;
  name = 'Serveur';
  loading = false;

  @Output() return = new EventEmitter<ModalResponse>();

  ngOnInit(): void {
    //
  }

  onSubmit(): void {
    if (this.tokenForm.controls['name'].dirty) {
      this.create(this.tokenForm.value.name);
    }
  }

  create(name): void {
    this.loading = true;
    this.operatorTokenService.post({ name }).subscribe(
      (response) => {
        this.loading = false;
        this.ref.close(response['token']);
      },
      (error) => {
        this.showTokenForm = false;
        this.loading = false;
      },
    );
  }
}
