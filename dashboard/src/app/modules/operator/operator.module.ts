/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/* External modules */
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService } from 'primeng/api';

/* Shared modules */
import { FormModule } from '~/shared/modules/form/form.module';
import { GraphicModule } from '~/shared/modules/graphic/graphic.module';
import { JourneyUIModule } from '~/modules/journeys/modules/ui/ui.module';
import { TableService } from '~/shared/services/tableService';
import { TranslationService } from '~/shared/services/translationService';

/* Local modules */
import { OperatorRoutingModule } from './operator.routing';
import { OperatorDialogModule } from './modules/operators/dialog/dialog.module';
import { OperatorUIModule } from './modules/operators/ui/ui.module';
import { OperatorTokenModule } from './modules/token/token.module';
/* Local components */
import { OperatorListComponent } from './pages/list/component';
import { OperatorTokenPageComponent } from './pages/token/component';
import { OperatorSettingsComponent } from './pages/settings/component';
import { OperatorJourneyImportComponent } from './pages/journeyImport/component';
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
    JourneyUIModule,
    CardModule,
    OperatorTokenModule,
    ButtonModule,
    InputTextModule,
  ],
  providers: [
    OperatorService,
    OperatorTokenService,
    DialogService,
    TranslationService,
    TableService,
  ],
  declarations: [
    OperatorListComponent,
    OperatorTokenPageComponent,
    OperatorSettingsComponent,
    OperatorJourneyImportComponent,
  ],
  exports: [
    OperatorUIModule,
    OperatorListComponent,
    OperatorTokenPageComponent,
    OperatorSettingsComponent,
  ],
})
export class OperatorModule { }
