import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

import { User } from '~/core/entities/authentication/user';
import { OperatorToken } from '~/core/entities/operator/operatorToken';
import { OperatorTokenInterface } from '~/core/interfaces/operator/operatorTokenInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';

import { OperatorTokenModalComponent } from '../operator-token-modal/operator-token-modal.component';
import { OperatorTokenService } from '../../../../services/operator-token.service';

@Component({
  selector: 'app-operator-token-form',
  templateUrl: './operator-token-form.component.html',
  styleUrls: ['./operator-token-form.component.scss'],
})
export class OperatorTokenFormComponent extends DestroyObservable implements OnInit {
  @Output() onClose: EventEmitter<User> = new EventEmitter<User>();

  public isCreating: boolean;
  public operatorTokenForm: FormGroup;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private operatorTokenService: OperatorTokenService,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    this.initForm();
  }

  get controls() {
    return this.operatorTokenForm.controls;
  }

  public onCreateToken(): void {
    const operatorToken = new OperatorToken(this.operatorTokenForm.value);
    this.operatorTokenService
      .createTokenAndList(operatorToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          const token = data[0].token;
          this.onClose.emit();
          this.openModal({
            token,
            name: operatorToken.name,
          });
          this.toastr.success("Le token d'accès à l'API a bien été créé");
          // todo: should be in service
          this.operatorTokenService
            .load()
            .pipe(takeUntil(this.destroy$))
            .subscribe();
        },
        (err) => {
          this.onClose.emit();
          // this.toastr.error(err.message);
        },
      );
  }

  private openModal(token: { name: string; token: string }) {
    const dialogRef = this.dialog.open(OperatorTokenModalComponent, {
      width: '600px',
      data: token,
    });
  }

  private initForm(): void {
    this.operatorTokenForm = this.fb.group({
      name: [null, Validators.required],
    });
  }
}
