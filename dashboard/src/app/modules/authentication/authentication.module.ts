import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '~/shared/shared.module';
import { MaterialModule } from '~/shared/modules/material/material.module';

import { LoginComponent } from './pages/login/login.component';
import { AuthenticationRoutingModule } from './authentication-routing.module';

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, SharedModule, MaterialModule, FormsModule, ReactiveFormsModule, AuthenticationRoutingModule],
})
export class AuthenticationModule {}
