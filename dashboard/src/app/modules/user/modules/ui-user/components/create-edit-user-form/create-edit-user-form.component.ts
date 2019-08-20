import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { UserService } from '~/core/services/authentication/user.service';
import { regexp } from '~/core/config/validators';
import { User } from '~/core/entities/authentication/user';

@Component({
  selector: 'app-create-edit-user-form',
  templateUrl: './create-edit-user-form.component.html',
  styleUrls: ['./create-edit-user-form.component.scss'],
})
export class CreateEditUserFormComponent implements OnInit {
  @Input() user: User;
  @Input() isCreating: boolean;

  @Output() onCreateEditUser: EventEmitter<User> = new EventEmitter<User>();

  createEditUserForm: FormGroup;
  isCreatingUpdating = false;

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
        this.onCreateEditUser.emit(user);
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

  private initForm(): void {
    this.createEditUserForm = this.fb.group({
      firstname: [this.user.firstname, Validators.required],
      lastname: [this.user.lastname, Validators.required],
      email: [this.user.email, [Validators.required, Validators.pattern(regexp.email)]],
      phone: [this.user.phone, Validators.pattern(regexp.phone)],
      role: [this.user.role, this.isCreating ? Validators.required : null],
    });
  }
}
