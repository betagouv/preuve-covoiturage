/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* External modules */
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';


/* Shared modules */
import { FormModule } from '~/shared/form/form.module';
import { GraphicModule } from '~/shared/graphic/graphic.module';

/* Local modules */
import { OperatorRoutingModule } from './operator.routing';
import { OperatorDialogModule } from './modules/dialog/dialog.module';
import { OperatorUIModule } from './modules/ui/ui.module';

/* Local components */
import { OperatorListComponent } from './pages/list/component';
import { TokenComponent } from './pages/token/component';
import { OperatorSettingsComponent } from './pages/settings/component';

import { TokenCreationComponent } from './components/token/component';
import { OperatorCopyComponent } from './components/copy/component';


/* Local services */
import { OperatorService } from './services/operatorService';
import { OperatorTokenService } from './services/operatorTokenService';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormModule,
    GraphicModule,
    OperatorRoutingModule,
    TableModule,
    MultiSelectModule,
    OperatorDialogModule,
    OperatorUIModule,
    CardModule,
  ],
  providers: [
    OperatorService,
    OperatorTokenService,
  ],
  declarations: [
    OperatorListComponent,
    TokenComponent,
    OperatorSettingsComponent,
    TokenCreationComponent,
    OperatorCopyComponent,
  ],
  exports: [
    OperatorUIModule,
    OperatorListComponent,
    TokenComponent,
    OperatorSettingsComponent,
    TokenCreationComponent,
    OperatorCopyComponent,
  ],
})
export class OperatorModule { }
