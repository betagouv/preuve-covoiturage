/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/* External modules */
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';

/* Shared modules */
import { FormModule } from '~/shared/modules/form/form.module';
import { GraphicModule } from '~/shared/modules/graphic/graphic.module';
import { OperatorUIModule } from '~/modules/operator/modules/operators/ui/ui.module';
import { AomUIModule } from '~/modules/aom/modules/ui/ui.module';
import { TranslationService } from '~/shared/services/translationService';
import { TableService } from '~/shared/services/tableService';
import { AomTownUIModule } from '~/modules/aom/modules/town/ui/ui.module';

/* Local modules */
import { JourneyRoutingModule } from './journey.routing';
import { JourneyUIModule } from './modules/ui/ui.module';
/* Local components */
import { JourneyListComponent } from './components/list/component';
import { JourneyListPageComponent } from './pages/list/component';
import { JourneyFilterComponent } from './components/filter/component';
/* Local services */
import { JourneyService } from './services/journeyService';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormModule,
    GraphicModule,
    JourneyRoutingModule,
    AutoCompleteModule,
    TableModule,
    MultiSelectModule,
    SliderModule,
    CalendarModule,
    CardModule,
    CheckboxModule,
    OperatorUIModule,
    AomUIModule,
    InputTextModule,
    ButtonModule,
    SplitButtonModule,
    AomTownUIModule,
  ],
  providers: [
    JourneyService,
    TranslationService,
    TableService,
  ],
  declarations: [
    JourneyListComponent,
    JourneyListPageComponent,
    JourneyFilterComponent,
  ],
  exports: [
    JourneyListPageComponent,
    JourneyUIModule,
  ],
})
export class JourneyModule {
}
