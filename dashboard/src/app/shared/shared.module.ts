import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FrenchMatPaginatorIntl } from '~/shared/classes/french-paginator';

import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { ButtonHrefDirective } from './directives/button-href.directive';
import { ButtonSpinnerDirective } from './directives/button-spinner.directive';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { EuroPipe } from './pipes/euro.pipe';
import { PointPipe } from './pipes/point.pipe';
import { KilometerPipe } from './pipes/km.pipe';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { HelpCardComponent } from './components/help-card/help-card.component';
import { ListItemComponent } from './components/list-item/list-item.component';
import { MaterialModule } from './modules/material/material.module';
import { MatProgressSpinnerModule, MatSpinner } from '@angular/material/progress-spinner';
import { MenuCardComponent } from './components/menu-card/menu-card.component';
import { PageContentComponent } from './components/page-content/page-content.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { RangeTimePickerComponent } from './components/range-time-picker/range-time-picker.component';
import { UploadComponent } from './components/upload/upload.component';

@NgModule({
  declarations: [
    AutocompleteComponent,
    ButtonHrefDirective,
    ButtonSpinnerDirective,
    EllipsisPipe,
    EuroPipe,
    PointPipe,
    KilometerPipe,
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    ListItemComponent,
    MenuCardComponent,
    PageContentComponent,
    PageHeaderComponent,
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
    PointPipe,
    KilometerPipe,
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    ListItemComponent,
    MenuCardComponent,
    PageContentComponent,
    PageHeaderComponent,
    RangeTimePickerComponent,
    UploadComponent,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: FrenchMatPaginatorIntl }],
  entryComponents: [MatSpinner],
})
export class SharedModule {}
