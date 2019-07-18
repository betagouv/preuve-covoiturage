import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {UiUserModule} from './ui-user/ui-user.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    UiUserModule
  ]
})
export class UserModule {
}
