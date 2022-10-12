import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';

import { MatProgressSpinnerModule, MatSpinner } from '@angular/material/progress-spinner';
import { FrenchMatPaginatorIntl } from './classes/french-paginator';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { HelpCardComponent } from './components/help-card/help-card.component';
import { ListItemComponent } from './components/list-item/list-item.component';
import { MenuCardComponent } from './components/menu-card/menu-card.component';
import { PageContentComponent } from './components/page-content/page-content.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { RangeTimePickerComponent } from './components/range-time-picker/range-time-picker.component';
import { UploadComponent } from './components/upload/upload.component';
import { ButtonHrefDirective } from './directives/button-href.directive';
import { ButtonSpinnerDirective } from './directives/button-spinner.directive';
import { MaterialModule } from './modules/material/material.module';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { EuroPipe } from './pipes/euro.pipe';
import { FilesizePipe } from './pipes/filesize.pipe';
import { IsNumberPipe } from './pipes/is-number.pipe';
import { KilometerPipe } from './pipes/km.pipe';
import { PointPipe } from './pipes/point.pipe';

@NgModule({
  declarations: [
    AutocompleteComponent,
    ButtonHrefDirective,
    ButtonSpinnerDirective,
    EllipsisPipe,
    EuroPipe,
    FilesizePipe,
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    IsNumberPipe,
    KilometerPipe,
    ListItemComponent,
    MenuCardComponent,
    PageContentComponent,
    PageHeaderComponent,
    PointPipe,
    RangeTimePickerComponent,
    UploadComponent,
  ],
  imports: [MaterialModule, CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatProgressSpinnerModule],
  exports: [
    AutocompleteComponent,
    ButtonSpinnerDirective,
    CommonModule,
    EllipsisPipe,
    EuroPipe,
    FilesizePipe,
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    IsNumberPipe,
    KilometerPipe,
    ListItemComponent,
    MenuCardComponent,
    PageContentComponent,
    PageHeaderComponent,
    PointPipe,
    RangeTimePickerComponent,
    UploadComponent,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: FrenchMatPaginatorIntl }],
  entryComponents: [MatSpinner],
})
export class SharedModule {}
