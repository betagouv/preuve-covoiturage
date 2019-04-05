/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* External modules */
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  DialogService,
  ConfirmationService,
} from 'primeng/api';
import { CardModule } from 'primeng/card';

/* Shared modules */
import { FormModule } from '~/shared/form/form.module';
import { GraphicModule } from '~/shared/graphic/graphic.module';

/* Local modules */
import { AomRoutingModule } from './aom.routing';
import { AomDialogModule } from './modules/dialog/dialog.module';
import { AomUIModule } from './modules/ui/ui.module';

/* Local components */
import { AomListComponent } from './pages/list/component';
import { AomSettingsComponent } from './pages/settings/component';

/* Local services */
import { AomService } from './services/aomService';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    MultiSelectModule,
    FormModule,
    GraphicModule,
    AomRoutingModule,
    AomDialogModule,
    AomUIModule,
    CardModule,

  ],
  providers: [
    AomService,
    DialogService,
    ConfirmationService,
  ],
  declarations: [
    AomListComponent,
    AomSettingsComponent,
  ],
  exports: [
    AomListComponent,
    AomSettingsComponent,
    AomUIModule,
  ],
})
export class AomModule { }
