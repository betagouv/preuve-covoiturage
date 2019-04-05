/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* Prime NG imports */
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FieldsetModule } from 'primeng/fieldset';
import { ButtonModule } from 'primeng/button';


/* Local components */
import { OperatorShowComponent } from './components/show/component';
import { OperatorDropdownComponent } from './components/dropdown/component';
import { OperatorViewComponent } from './components/view/component';
import { OperatorMultipleDropdownComponent } from './components/multipleDropdown/component';


/* Local services */
import { OperatorService } from '../../services/operatorService';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    FieldsetModule,
    ButtonModule,
  ],
  providers: [
    OperatorService,
  ],
  declarations: [
    OperatorShowComponent,
    OperatorDropdownComponent,
    OperatorViewComponent,
    OperatorMultipleDropdownComponent,
  ],
  exports: [
    OperatorShowComponent,
    OperatorDropdownComponent,
    OperatorViewComponent,
    OperatorMultipleDropdownComponent,
  ],
})
export class OperatorUIModule { }
