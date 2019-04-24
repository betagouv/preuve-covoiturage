/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
/* External modules */
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService } from 'primeng/api';

/* Shared modules */
import { FormModule } from '~/shared/modules/form/form.module';
import { GraphicModule } from '~/shared/modules/graphic/graphic.module';
import { TranslationService } from '~/shared/services/translationService';
import { TableService } from '~/shared/services/tableService';

/* Local modules */
import { UserRoutingModule } from './user.routing';
import { UserDialogModule } from './modules/dialog/dialog.module';
import { UserUIModule } from './modules/ui/ui.module';
import { UserProfileModule } from './modules/profile/profile.module';
/* Local components */
import { UserListComponent } from './pages/list/component';
import { UserSettingsComponent } from './pages/settings/component';
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
    ButtonModule,
    DialogModule,
    InputTextModule,
  ],
  providers: [
    UserService,
    ProfileService,
    DialogService,
    TranslationService,
    TableService,
  ],
  declarations: [
    UserListComponent,
    UserSettingsComponent,
  ],
  exports: [
    UserListComponent,
    UserSettingsComponent,
  ],
})
export class UserModule { }
