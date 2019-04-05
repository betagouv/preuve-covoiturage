/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';

/* External modules */
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';

/* Shared modules */
import { FormModule } from '~/shared/form/form.module';
import { GraphicModule } from '~/shared/graphic/graphic.module';

/* Local modules */
import { UserRoutingModule } from './user.routing';
import { UserDialogModule } from './modules/dialog/dialog.module';
import { UserUIModule } from './modules/ui/ui.module';
import { UserProfileModule } from './modules/profile/profile.module';

/* Local components */
import { UserListComponent } from './pages/list/component';
import { UserSettingsComponent } from './pages/settings/component';
import { PasswordResetDialogComponent } from './components/password/reset/dialog/component';
import { PasswordResetViewComponent } from './components/password/reset/view/component';

/* Local services */
import { UserService } from './services/userService';
import { ProfileService } from './services/profileService';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormModule,
    GraphicModule,
    UserRoutingModule,
    TableModule,
    MultiSelectModule,
    UserDialogModule,
    UserUIModule,
    CardModule,
    UserProfileModule,
  ],
  providers: [
    UserService,
    ProfileService,
  ],
  declarations: [
    UserListComponent,
    UserSettingsComponent,
    PasswordResetViewComponent,
    PasswordResetDialogComponent,
  ],
  exports: [
    UserListComponent,
    UserSettingsComponent,
  ],
})
export class UserModule { }
