import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { UserService } from '~/core/services/authentication/user.service';
import { REGEXP } from '~/core/const/validators.const';
import { User } from '~/core/entities/authentication/user';
import { USER_ROLES, USER_ROLES_FR, UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { USER_GROUPS, USER_GROUPS_FR, UserGroupEnum } from '~/core/enums/user/user-group.enum';

@Component({
  selector: 'app-create-edit-user-form',
  templateUrl: './create-edit-user-form.component.html',
  styleUrls: ['./create-edit-user-form.component.scss'],
})
export class CreateEditUserFormComponent implements OnInit {
  @Input() user: User;
  @Input() isCreating: boolean;
  @Input() groupEditable: boolean;

  @Output() onCloseEditUser: EventEmitter<User> = new EventEmitter<User>();

  createEditUserForm: FormGroup;
  isCreatingUpdating = false;
  public roles = USER_ROLES;
  public groups = USER_GROUPS;

  constructor(private fb: FormBuilder, private _userService: UserService, private toastr: ToastrService) {}

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
    jsonRPCRequest.subscribe(
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

  public startEdit(isCreating: boolean, groupEditable: boolean, user: User) {
    // this.initForm(isCreating, groupEditable, user);

    this.createEditUserForm.controls['role'].setValidators(isCreating ? Validators.required : null);
    this.createEditUserForm.controls['group'].setValidators(groupEditable ? Validators.required : null);

    this.createEditUserForm.setValue({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      role: user.role,
      group: user.group,
    });
  }

  public getFrenchRole(role: UserRoleEnum): string {
    return USER_ROLES_FR[role];
  }

  public getFrenchGroup(group: UserGroupEnum): string {
    return USER_GROUPS_FR[group];
  }

  private initForm(
    isCreating: boolean = this.isCreating,
    groupEditable: boolean = this.groupEditable,
    user: User = this.user,
  ): void {
    console.log(isCreating);
    console.log(groupEditable);

    this.createEditUserForm = this.fb.group({
      firstname: [user.firstname, Validators.required],
      lastname: [user.lastname, Validators.required],
      email: [user.email, [Validators.required, Validators.pattern(REGEXP.email)]],
      phone: [user.phone, Validators.pattern(REGEXP.phone)],
      role: [user.role, isCreating ? Validators.required : null],
      group: [user.group, groupEditable ? Validators.required : null],
    });
  }
}
