/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* Prime NG imports */
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';

/* Local components */
import { AomDropdownComponent } from './components/dropdown/component';
import { AomMultipleDropdownComponent } from './components/multipleDropdown/component';

/* Local services */
import { AomService } from '../../services/aomService';
import { AomViewComponent } from './components/view/component';

@NgModule({
  imports: [CommonModule, FormsModule, AutoCompleteModule, ButtonModule, FieldsetModule],
  providers: [AomService],
  declarations: [AomDropdownComponent, AomViewComponent, AomMultipleDropdownComponent],
  exports: [AomDropdownComponent, AomViewComponent, AomMultipleDropdownComponent],
})
export class AomUIModule {}
