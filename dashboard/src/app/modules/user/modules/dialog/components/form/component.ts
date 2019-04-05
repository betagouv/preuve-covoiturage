import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { password, regexp } from '~/entities/validators';
import { User } from '~/entities/database/user/user';

@Component({
  selector: 'app-user-form',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class UserFormComponent implements OnInit {
  @Input('user')
  set userInput(user: User) {
    if (user) {
      this.userForm.patchValue(user);
    }
  }

  @Output() answer = new EventEmitter();

  public roles = [
    {
      label: 'Utilisateur',
      value: 'user',
    },
    {
      label: 'Administrateur',
      value: 'admin',
    },
  ];

  public groups = [
    {
      label: 'Aom',
      value: 'aom',
    },
    {
      label: 'Opérateur',
      value: 'operators',
    },
    {
      label: 'Registre',
      value: 'registry',
    },
  ];

  public userForm = this.fb.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern(regexp.email)]],
    phone: ['', [Validators.required]],
    role: ['user', Validators.required],
    password: ['', [Validators.required, Validators.minLength(password.min), Validators.maxLength(password.max)]],
    group: [''],
    aom: [null],
    operator: [null],
  });

  constructor(
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.onChanges();
  }

  onSubmit() {
    const user = {};

    // clean up unwanted values
    switch (this.userForm.value['group']) {
      case 'aom':
        this.userForm.patchValue({ operator: null });
        this.userForm.get('operator').markAsDirty();
        break;
      case 'operators':
        this.userForm.patchValue({ aom: null });
        this.userForm.get('aom').markAsDirty();
        break;
      case 'registry':
        this.userForm.patchValue({ aom: null, operator: null });
        this.userForm.get('operator').markAsDirty();
        this.userForm.get('aom').markAsDirty();
        break;
    }

    Object.keys(this.userForm.controls)
      .forEach((prop) => {
        if (this.userForm.controls[prop].dirty) {
          user[prop] = this.userForm.value[prop];
        }
      });

    this.answer.emit(user);
  }

  onChanges() {
    // this.userForm.get('group')
    //   .valueChanges
    //   .subscribe(() => {
    //     this.userForm.patchValue({
    //       aom: null,
    //       operator: null,
    //     });
    //   });
  }

  isAdmin(): boolean {
    return this.userForm.value.role === 'admin';
  }

  isAom(): boolean {
    return this.userForm.value.group === 'aom';
  }

  isOperator(): boolean {
    return this.userForm.value.group === 'operators';
  }

  json() {
    return JSON.stringify(this.userForm.value);
  }
}
