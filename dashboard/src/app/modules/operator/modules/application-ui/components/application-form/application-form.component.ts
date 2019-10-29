import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

import { User } from '~/core/entities/authentication/user';
import { ApplicationName } from '~/core/entities/operator/applicationName';
import { DestroyObservable } from '~/core/components/destroy-observable';

import { ApplicationModalComponent } from '../application-modal/application-modal.component';
import { ApplicationService } from '../../../../services/application.service';

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
    private operatorTokenService: ApplicationService,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    this.initForm();
  }

  get controls() {
    return this.applicationForm.controls;
  }

  public onCreateToken(): void {
    const applicationName = new ApplicationName(this.applicationForm.value);
    this.operatorTokenService
      .createApplicationAndList(applicationName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          const token = data[0].token;
          this.onClose.emit();
          this.openModal({
            token,
            name: applicationName.name,
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
    const dialogRef = this.dialog.open(ApplicationModalComponent, {
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
