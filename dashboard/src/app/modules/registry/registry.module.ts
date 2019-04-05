/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


/* External modules */
import { OperatorUIModule } from '~/modules/operator/modules/operators/ui/ui.module';
import { JourneyUIModule } from '~/modules/journeys/modules/ui/ui.module';

/* Shared modules */

/* Local modules */
import { RegistryRoutingModule } from './registry.routing';

/* Local components */
import { RegistryJourneyImportComponent } from './pages/journeyImport/component';


/* Local services */


@NgModule({
  imports: [
    CommonModule,
    OperatorUIModule,
    JourneyUIModule,
    RegistryRoutingModule,
  ],
  providers: [
  ],
  declarations: [
    RegistryJourneyImportComponent,
  ],
  exports: [
  ],
})
export class RegistryModule { }
