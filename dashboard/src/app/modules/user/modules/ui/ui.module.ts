/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* Prime NG imports */
import { AutoCompleteModule } from 'primeng/autocomplete';

/* Local components */
import { UserDropdownComponent } from './components/dropdown/component';

/* Local services */
import { UserService } from '../../services/userService';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
  ],
  providers: [
    UserService,
  ],
  declarations: [
    UserDropdownComponent,
  ],
  exports: [
    UserDropdownComponent,
  ],
})
export class UserUIModule { }
