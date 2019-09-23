import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '~/core/services/authentication/user.service';
import { REGEXP } from '~/core/const/validators.const';
import { User } from '~/core/entities/authentication/user';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { USER_ROLES, USER_ROLES_FR, UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { USER_GROUPS, USER_GROUPS_FR, UserGroupEnum } from '~/core/enums/user/user-group.enum';

@Component({
  selector: 'app-create-edit-user-form',
  templateUrl: './create-edit-user-form.component.html',
  styleUrls: ['./create-edit-user-form.component.scss'],
})
export class CreateEditUserFormComponent extends DestroyObservable implements OnInit, OnChanges {
  @Input() user: User;
  @Input() isCreating: boolean;
  @Input() groupEditable: boolean;

  @Output() onCloseEditUser: EventEmitter<User> = new EventEmitter<User>();

  createEditUserForm: FormGroup;
  isCreatingUpdating = false;
  territoryEditable = false;
  operatorEditable = false;

  public roles = USER_ROLES;
  public groups = USER_GROUPS;

  constructor(private fb: FormBuilder, private _userService: UserService, private toastr: ToastrService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isCreating'] || changes['groupEditable']) {
      this.updateValidators();
    }

    if (changes['user']) {
      this.updateValidators();
      if (this.createEditUserForm) {
        this.createEditUserForm.setValue({
          firstname: this.user.firstname,
          lastname: this.user.lastname,
          email: this.user.email,
          phone: this.user.phone,
          role: this.user.role,
          group: this.user.group,
          territory: this.user.territory ? this.user.territory : null,
          operator: this.user.operator ? this.user.operator : null,
        });
      }
    }
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

    // clean data (avoid API validation issue for non operator | territories
    const formVal = { ...this.createEditUserForm.value };
    if (!formVal.territory) delete formVal.territory;
    if (!formVal.operator) delete formVal.operator;

    if (!this.isCreating) {
      delete formVal.territory;
      delete formVal.operator;
      delete formVal.group;
      delete formVal.role;
    }

    if (this.isCreating) {
      this._userService.createList(formVal).subscribe(
        (data) => {
          const user = data[0];
          this.isCreatingUpdating = false;
          this.toastr.success(
            `Un email a été envoyé à ${user.email}`,
            `L'utilisateur ${user.firstname} ${user.lastname} a été crée`,
          );
          this.onCloseEditUser.emit(user);
        },
        (err) => {
          this.isCreatingUpdating = false;
          this.toastr.error(err.message);
        },
      );
    } else {
      this._userService.patchList(formVal).subscribe(
        (data) => {
          const user = data[0];
          this.isCreatingUpdating = false;
          this.toastr.success(`Les informations de votre profil ont bien été modifiées`);
          this.onCloseEditUser.emit(user);
        },
        (err) => {
          this.isCreatingUpdating = false;
          this.toastr.error(err.message);
        },
      );
    }
  }

  updateValidators(isCreating: boolean = this.isCreating, groupEditable: boolean = this.groupEditable) {
    if (this.createEditUserForm) {
      this.createEditUserForm.controls['role'].setValidators(isCreating ? Validators.required : null);
      this.createEditUserForm.controls['group'].setValidators(groupEditable ? Validators.required : null);

      this.createEditUserForm.controls['operator'].setValidators(
        this.groupEditable && this.operatorEditable && this.isCreating ? Validators.required : null,
      );

      this.createEditUserForm.controls['territory'].setValidators(
        this.groupEditable && this.territoryEditable && this.isCreating ? Validators.required : null,
      );
    }
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
    this.createEditUserForm = this.fb.group({
      firstname: [user.firstname, Validators.required],
      lastname: [user.lastname, Validators.required],
      email: [user.email, [Validators.required, Validators.pattern(REGEXP.email)]],
      phone: [user.phone, Validators.pattern(REGEXP.phone)],
      role: [user.role],
      group: [user.group],
      territory: [user.territory],
      operator: [user.operator],
    });

    this.createEditUserForm.valueChanges.subscribe((formVal) => {
      const territoryEditable = formVal.group === UserGroupEnum.TERRITORY;
      if (territoryEditable !== this.territoryEditable) {
        this.territoryEditable = territoryEditable;
        if (!territoryEditable) this.createEditUserForm.patchValue({ territory: '' });
      }

      const operatorEditable = formVal.group === UserGroupEnum.OPERATOR;
      if (operatorEditable !== this.operatorEditable) {
        this.operatorEditable = operatorEditable;
        if (operatorEditable) this.createEditUserForm.patchValue({ operator: '' });
      }
    });

    this.updateValidators(isCreating, groupEditable);
  }
}
