import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { User } from '~/entities/database/user/user';
import { regexp } from '~/entities/validators';


@Component({
  selector: 'app-profile-form',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class ProfileFormComponent {
  @Input('user')
  set userInput(user: User) {
    if (user) {
      this.userForm.patchValue(user);
    }
  }
  @Output() answer = new EventEmitter();

  public userForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(regexp.phone)]],
    role: ['', Validators.required],
  });

  constructor(
      private fb: FormBuilder,
  ) {
  }

  onSubmit() {
    const user = {};
    Object.keys(this.userForm.controls).forEach((prop) => {
      if (this.userForm.controls[prop].dirty) {
        user[prop] = this.userForm.value[prop];
      }
    });
    this.answer.emit(user);
  }
}
