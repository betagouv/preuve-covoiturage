/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/* Prime NG imports */
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';

import { AomService } from '../../../../aom/services/aomService';

/* Local components */
import { AomTownMultipleDropdownComponent } from './components/multipleDropdown/component';

/* Local services */


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    ButtonModule,
    FieldsetModule,
  ],
  providers: [
    AomService,
  ],
  declarations: [
    AomTownMultipleDropdownComponent,
  ],
  exports: [
    AomTownMultipleDropdownComponent,
  ],
})
export class AomTownUIModule { }
