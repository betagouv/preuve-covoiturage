import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';

import { User } from '~/core/entities/authentication/user';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { ApplicationStoreService } from '~/modules/operator/services/application-store.service';

import { ApplicationModalComponent } from '../application-modal/application-modal.component';

@Component({
  selector: 'app-application-form',
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss'],
})
export class ApplicationFormComponent extends DestroyObservable implements OnInit {
  @Output() onClose: EventEmitter<User> = new EventEmitter<User>();

  public isCreating: boolean;
  public applicationForm: FormGroup;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private _applicationStoreService: ApplicationStoreService,
    private _toastr: ToastrService,
    private _authService: AuthenticationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();
  }
  get controls(): { [key: string]: AbstractControl } {
    return this.applicationForm.controls;
  }

  public onCreateToken(): void {
    const applicationName = this.applicationForm.value.name;
    const operatorId = this._authService.user.operator_id;
    this._applicationStoreService
      .createApplicationAndList({
        name: applicationName,
        owner_id: operatorId,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          const token = data.token;
          this.onClose.emit();
          this.openModal({
            token,
            name: applicationName.name,
          });
          this._toastr.success("Le token d'accès à l'API a bien été créé");
        },
        (err) => {
          this.onClose.emit();
        },
      );
  }

  private openModal(token: { name: string; token: string }): void {
    this.dialog.open(ApplicationModalComponent, {
      width: '600px',
      data: token,
    });
  }

  private initForm(): void {
    this.applicationForm = this.fb.group({
      name: [null, Validators.required],
    });
  }
}
