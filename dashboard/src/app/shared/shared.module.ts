import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { ButtonHrefDirective } from './directives/button-href.directive';
import { ButtonSpinnerDirective } from './directives/button-spinner.directive';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { EuroPipe } from './pipes/euro.pipe';
import { PointPipe } from './pipes/point.pipe';
import { KilometerPipe } from './pipes/km.pipe';
import { IsNumberPipe } from './pipes/is-number.pipe';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { HelpCardComponent } from './components/help-card/help-card.component';
import { ListItemComponent } from './components/list-item/list-item.component';
import { MaterialModule } from './modules/material/material.module';
import { MatProgressSpinnerModule, MatSpinner } from '@angular/material/progress-spinner';
import { MenuCardComponent } from './components/menu-card/menu-card.component';
import { PageContentComponent } from './components/page-content/page-content.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { UploadComponent } from './components/upload/upload.component';
import { FrenchMatPaginatorIntl } from './classes/french-paginator';

@NgModule({
  declarations: [
    AutocompleteComponent,
    ButtonHrefDirective,
    ButtonSpinnerDirective,
    EllipsisPipe,
    EuroPipe,
    PointPipe,
    KilometerPipe,
    IsNumberPipe,
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    ListItemComponent,
    MenuCardComponent,
    PageContentComponent,
    PageHeaderComponent,
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
    IsNumberPipe,
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    ListItemComponent,
    MenuCardComponent,
    PageContentComponent,
    PageHeaderComponent,
    UploadComponent,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: FrenchMatPaginatorIntl }],
  entryComponents: [MatSpinner],
})
export class SharedModule {}
