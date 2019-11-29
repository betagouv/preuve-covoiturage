import { filter, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { REGEXP } from '~/core/const/validators.const';
import { User } from '~/core/entities/authentication/user';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { USER_ROLES, USER_ROLES_FR, UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { USER_GROUPS, USER_GROUPS_FR, UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserStoreService } from '~/modules/user/services/user-store.service';

@Component({
  selector: 'app-create-edit-user-form',
  templateUrl: './create-edit-user-form.component.html',
  styleUrls: ['./create-edit-user-form.component.scss'],
})
export class CreateEditUserFormComponent extends DestroyObservable implements OnInit, OnChanges {
  @Input() isCreating: boolean;
  @Input() groupEditable: boolean;

  @Output() onCloseEditUser: EventEmitter<User> = new EventEmitter<User>();

  createEditUserForm: FormGroup;
  isCreatingUpdating = false;
  territoryEditable = false;
  operatorEditable = false;

  public roles = USER_ROLES;
  public groups = USER_GROUPS;

  constructor(private fb: FormBuilder, private _userStoreService: UserStoreService, private toastr: ToastrService) {
    super();
  }

  updateFormValues(user: User) {
    this.updateValidators();
    if (this.createEditUserForm) {
      this.createEditUserForm.setValue(user.toFormValues());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isCreating'] || changes['groupEditable']) {
      this.updateValidators();
    }
  }

  ngOnInit() {
    this.initForm();
  }

  get controls() {
    return this.createEditUserForm.controls;
  }

  public onUpdateUser(): void {
    this.isCreatingUpdating = true;

    const errM = (err) => {
      if (err.status === 409) this.toastr.error('Cette adresse email est déjà utilisée');
      this.isCreatingUpdating = false;
      // this.toastr.error(err.message);
      throw err;
    };

    if (this.isCreating) {
      this._userStoreService.create(this.createEditUserForm.value).subscribe((data) => {
        const user = data[0];
        this.isCreatingUpdating = false;
        this.toastr.success(
          `Un email a été envoyé à ${user.email}`,
          `L'utilisateur ${user.firstname} ${user.lastname} a été créé`,
        );
        this.onCloseEditUser.emit(user);
      }, errM);
    } else {
      const model = new User();
      model._id = this._userStoreService.entity._id;

      this._userStoreService
        .patchSelected(User.formValueToUserPatch(this.createEditUserForm.value))
        .subscribe((data) => {
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
      console.log('operatorEditable', this.operatorEditable, 'territoryEditable', this.territoryEditable);
      this.createEditUserForm.controls['operator_id'].setValidators(
        this.groupEditable && this.operatorEditable && this.isCreating ? Validators.required : null,
      );

      this.createEditUserForm.controls['territory_id'].setValidators(
        this.groupEditable && this.territoryEditable && this.isCreating ? Validators.required : null,
      );

      this.createEditUserForm.updateValueAndValidity();
    }
  }

  public getFrenchRole(role: UserRoleEnum): string {
    return USER_ROLES_FR[role];
  }

  public getFrenchGroup(group: UserGroupEnum): string {
    return USER_GROUPS_FR[group];
  }

  onGroupChange(): void {
    this.createEditUserForm.get('operator_id').setValue(null);
    this.createEditUserForm.get('territory_id').setValue(null);
    this.updateValidators();
  }

  private initForm(isCreating: boolean = this.isCreating, groupEditable: boolean = this.groupEditable): void {
    // const cleanUser = user.toFormValues();

    this.createEditUserForm = this.fb.group({
      firstname: [null, Validators.required],
      lastname: [null, Validators.required],
      email: [null, [Validators.required, Validators.pattern(REGEXP.email)]],
      phone: [null, Validators.pattern(REGEXP.phone)],
      role: [null],
      group: [null],
      territory_id: [null],
      operator_id: [null],
    });

    this._userStoreService.entity$
      .pipe(
        filter((user) => !!user),
        takeUntil(this.destroy$),
      )
      .subscribe((currentUser) => this.updateFormValues(currentUser));

    this.createEditUserForm.valueChanges.subscribe((formVal) => {
      const territoryEditable = formVal.group === UserGroupEnum.TERRITORY;
      if (territoryEditable !== this.territoryEditable) {
        this.territoryEditable = territoryEditable;
        // if (!territoryEditable) this.createEditUserForm.patchValue({ territory: '' });
        this.updateValidators();
      }

      const operatorEditable = formVal.group === UserGroupEnum.OPERATOR;
      if (operatorEditable !== this.operatorEditable) {
        this.operatorEditable = operatorEditable;
        // todo: not sure this is valid, operator should not be reset during edition of form
        // if (operatorEditable) this.createEditUserForm.patchValue({ operator: '' });
        this.updateValidators();
      }
    });

    this.updateValidators(isCreating, groupEditable);
  }
}
