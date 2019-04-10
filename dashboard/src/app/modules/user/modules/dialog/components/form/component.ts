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
    firstname: [null, Validators.required],
    lastname: [null, Validators.required],
    email: [null, [Validators.required, Validators.pattern(regexp.email)]],
    phone: [null],
    role: ['user', Validators.required],
    password: [null, [Validators.required, Validators.minLength(password.min), Validators.maxLength(password.max)]],
    group: [null, Validators.required],
    aom: [null],
    operator: [null],
  });

  constructor(
    private fb: FormBuilder,
  ) {
  }

  @Input('user')
  set userInput(user: User) {
    if (user) {
      this.userForm.patchValue(user);
    }
  }

  ngOnInit(): void {
    // nada
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
