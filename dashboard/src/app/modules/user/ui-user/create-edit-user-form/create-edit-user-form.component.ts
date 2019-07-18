import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../../../core/entities/authentication/user';

@Component({
  selector: 'app-create-edit-user-form',
  templateUrl: './create-edit-user-form.component.html',
  styleUrls: ['./create-edit-user-form.component.scss']
})
export class CreateEditUserFormComponent implements OnInit {

  createEditUserForm: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit() {
    this.initForm();
  }

  get isFormValid(): boolean {
    return this.createEditUserForm.valid;
  }

  get formValue(): User {
    return new User(this.createEditUserForm.getRawValue());
  }

  get controls() {
    return this.createEditUserForm.controls;
  }

  private initForm(): void {
    this.createEditUserForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

}
