import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '~/modules/user/services/user.service';
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

  cleanUserForForm(user = this.user): User {
    return {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      role: '',
      permissions: [],
      ...user,
    };
  }

  updateFormValues() {
    const user: User = this.cleanUserForForm();

    this.updateValidators();
    if (this.createEditUserForm) {
      this.createEditUserForm.setValue({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone ? user.phone : null,
        role: user.role,
        group: user.group,
        territory: user.territory ? user.territory : null,
        operator: user.operator ? user.operator : null,
      });

      Object.keys(this.createEditUserForm.controls).forEach((key) => {
        this.createEditUserForm.controls[key].setErrors(null);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isCreating'] || changes['groupEditable']) {
      this.updateValidators();
    }

    if (changes['user']) {
      this.updateFormValues();
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
    formVal.phone = formVal.phone ? formVal.phone : null;

    if (!this.isCreating) {
      delete formVal.territory;
      delete formVal.operator;
      delete formVal.group;
      delete formVal.role;
    }

    const errM = (err) => {
      if (err.status === 409) this.toastr.error('Cette adresse email est déjà utilisée');
      this.isCreatingUpdating = false;
      // this.toastr.error(err.message);
      throw err;
    };

    if (this.isCreating) {
      this._userService.createList(formVal).subscribe((data) => {
        const user = data[0];
        this.isCreatingUpdating = false;
        this.toastr.success(
          `Un email a été envoyé à ${user.email}`,
          `L'utilisateur ${user.firstname} ${user.lastname} a été créé`,
        );
        this.onCloseEditUser.emit(user);
      }, errM);
    } else {
      this._userService.patchList({ ...formVal, _id: this.user._id }).subscribe((data) => {
        const user = data[0];
        this.isCreatingUpdating = false;
        this.toastr.success(`Les informations ont bien été modifiées`);
        this.onCloseEditUser.emit(user);
      }, errM);
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

  onGroupChange(): void {
    this.createEditUserForm.get('operator').setValue(null);
    this.createEditUserForm.get('territory').setValue(null);
  }

  private initForm(
    isCreating: boolean = this.isCreating,
    groupEditable: boolean = this.groupEditable,
    user: User = this.user,
  ): void {
    const cleanUser = this.cleanUserForForm(user);
    this.createEditUserForm = this.fb.group({
      firstname: [cleanUser.firstname, Validators.required],
      lastname: [cleanUser.lastname, Validators.required],
      email: [cleanUser.email, [Validators.required, Validators.pattern(REGEXP.email)]],
      phone: [cleanUser.phone, Validators.pattern(REGEXP.phone)],
      role: [cleanUser.role],
      group: [cleanUser.group],
      territory: [cleanUser.territory],
      operator: [cleanUser.operator],
    });

    this.createEditUserForm.valueChanges.subscribe((formVal) => {
      const territoryEditable = formVal.group === UserGroupEnum.TERRITORY;
      if (territoryEditable !== this.territoryEditable) {
        this.territoryEditable = territoryEditable;
        // if (!territoryEditable) this.createEditUserForm.patchValue({ territory: '' });
      }

      const operatorEditable = formVal.group === UserGroupEnum.OPERATOR;
      if (operatorEditable !== this.operatorEditable) {
        this.operatorEditable = operatorEditable;
        // todo: not sure this is valid, operator should not be reset during edition of form
        // if (operatorEditable) this.createEditUserForm.patchValue({ operator: '' });
      }
    });

    this.updateValidators(isCreating, groupEditable);

    this.updateFormValues();
  }
}
