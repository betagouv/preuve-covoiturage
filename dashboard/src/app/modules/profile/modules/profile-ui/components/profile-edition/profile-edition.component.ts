import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { regexp } from '~/shared/config/validators';

import { ProfileService } from '../../../../services/profile.service';

@Component({
  selector: 'app-profile-edition',
  templateUrl: './profile-edition.component.html',
  styleUrls: ['./profile-edition.component.scss'],
})
export class ProfileEditionComponent implements OnInit {
  public profileForm: FormGroup;

  constructor(private fb: FormBuilder, private profileService: ProfileService) {}

  ngOnInit() {
    this.initProfilForm();
  }

  get controls() {
    return this.profileForm.controls;
  }

  public onUpdateProfile(): void {
    this.profileService.patch(this.profileForm.getRawValue());
  }

  private initProfilForm(): void {
    this.profileForm = this.fb.group({
      firstname: [null, Validators.required],
      lastname: [null, Validators.required],
      email: [null, [Validators.required, Validators.pattern(regexp.email)]],
      phone: [null, Validators.pattern(regexp.phone)],
    });
  }
}
