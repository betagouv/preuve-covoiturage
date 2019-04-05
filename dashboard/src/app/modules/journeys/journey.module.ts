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
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';


/* Shared modules */
import { FormModule } from '~/shared/form/form.module';
import { GraphicModule } from '~/shared/graphic/graphic.module';
import { OperatorUIModule } from '~/modules/operator/modules/ui/ui.module';

/* Local modules */
import { JourneyRoutingModule } from './journey.routing';

/* Local components */
import { JourneyListComponent } from './components/list/component';
import { JourneyListPageComponent } from './pages/list/component';
import { JourneyUploadComponent } from './components/upload/component';
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
    FileUploadModule,
    CardModule,
    CheckboxModule,
    OperatorUIModule,
  ],
  providers: [
    JourneyService,
  ],
  declarations: [
    JourneyListComponent,
    JourneyListPageComponent,
    JourneyUploadComponent,
    JourneyFilterComponent,
  ],
  exports: [
    JourneyListPageComponent,
    JourneyUploadComponent,
  ],
})
export class JourneyModule { }
