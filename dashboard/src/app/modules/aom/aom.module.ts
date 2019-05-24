/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/* External modules */
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

/* Shared modules */
import { FormModule } from '~/shared/modules/form/form.module';
import { GraphicModule } from '~/shared/modules/graphic/graphic.module';
import { AomStatisticsComponent } from '~/modules/aom/pages/statistics/component';
import { TableService } from '~/shared/services/tableService';
import { TranslationService } from '~/shared/services/translationService';

/* Local modules */
import { AomRoutingModule } from './aom.routing';
import { AomDialogModule } from './modules/dialog/dialog.module';
import { AomUIModule } from './modules/ui/ui.module';
/* Local components */
import { AomListComponent } from './pages/list/component';
import { AomSettingsComponent } from './pages/settings/component';
/* Local services */
import { AomService } from './services/aomService';
import { StatisticsUIModule } from '../statistics/modules/ui/ui.module';

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
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    StatisticsUIModule,
  ],
  providers: [AomService, DialogService, TranslationService, TableService],
  declarations: [
    AomListComponent,
    AomSettingsComponent,
    AomStatisticsComponent,
  ],
  exports: [AomListComponent, AomSettingsComponent, AomUIModule],
})
export class AomModule {}
