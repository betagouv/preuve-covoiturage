/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
/* Prime NG imports */
import { FileUploadModule } from 'primeng/fileupload';
import { AccordionModule } from 'primeng/accordion';

/* Local services */
import { JourneyUploadComponent } from './components/upload/component';
import { JourneyService } from '../../services/journeyService';

/* Local components */
@NgModule({
  imports: [CommonModule, FileUploadModule, AccordionModule],
  providers: [JourneyService],
  declarations: [JourneyUploadComponent],
  exports: [JourneyUploadComponent],
})
export class JourneyUIModule {}
