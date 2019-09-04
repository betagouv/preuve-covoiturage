import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { UserService } from '~/core/services/authentication/user.service';
import { REGEXP } from '~/core/const/validators.const';
import { User } from '~/core/entities/authentication/user';
import { ROLES } from '~/core/const/roles.const';
import { roleType } from '~/core/types/mainType';
import { ROLE_FR } from '~/modules/user/const/role_fr.const';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-create-edit-user-form',
  templateUrl: './create-edit-user-form.component.html',
  styleUrls: ['./create-edit-user-form.component.scss'],
})
export class CreateEditUserFormComponent extends DestroyObservable implements OnInit {
  @Input() user: User;
  @Input() isCreating: boolean;

  @Output() onCloseEditUser: EventEmitter<User> = new EventEmitter<User>();

  createEditUserForm: FormGroup;
  isCreatingUpdating = false;
  public roles = ROLES;

  constructor(private fb: FormBuilder, private _userService: UserService, private toastr: ToastrService) {
    super();
  }

  ngOnInit() {
    if (!this.user) {
      this.user = new User();
    }
    this.initForm();
  }

  get controls() {
    return this.createEditUserForm.controls;
  }

  public onUpdateUser(): void {
    this.isCreatingUpdating = true;
    const jsonRPCRequest = this.isCreating
      ? this._userService.create(this.createEditUserForm.value)
      : this._userService.patch(this.createEditUserForm.value);
    jsonRPCRequest.pipe(takeUntil(this.destroy$)).subscribe(
      (user) => {
        this.isCreatingUpdating = false;
        if (this.isCreating) {
          this.toastr.success(
            `Un email a été envoyé à ${user.email}`,
            `L'utilisateur ${user.firstname} ${user.lastname} a été crée`,
          );
        } else {
          this.toastr.success(`Les informations de votre profil ont bien été modifiées`);
        }
        this.onCloseEditUser.emit(user);
      },
      (err) => {
        this.isCreatingUpdating = false;
        this.toastr.error(err.message);

        // TODO DELETE WHEN BACK IS OK
        const auxArray = this._userService._entities$.value;
        auxArray.push(this.createEditUserForm.value);
        this._userService._entities$.next(auxArray);
      },
    );
  }

  public getFrenchRole(role: roleType): string {
    return ROLE_FR[role];
  }

  private initForm(): void {
    this.createEditUserForm = this.fb.group({
      firstname: [this.user.firstname, Validators.required],
      lastname: [this.user.lastname, Validators.required],
      email: [this.user.email, [Validators.required, Validators.pattern(REGEXP.email)]],
      phone: [this.user.phone, Validators.pattern(REGEXP.phone)],
      role: [this.user.role, this.isCreating ? Validators.required : null],
    });
  }
}
