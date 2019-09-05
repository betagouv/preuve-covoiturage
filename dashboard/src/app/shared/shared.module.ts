import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSpinner } from '@angular/material';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from './modules/material/material.module';

import { ButtonSpinnerDirective } from './directives/button-spinner.directive';

import { PageContentComponent } from './components/page-content/page-content.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { HelpCardComponent } from './components/help-card/help-card.component';
import { ListItemComponent } from './components/list-item/list-item.component';
import { MenuCardComponent } from './components/menu-card/menu-card.component';
import { RangeTimePickerComponent } from './components/range-time-picker/range-time-picker.component';
import { UploadComponent } from './components/upload/upload.component';

@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    ListItemComponent,
    ButtonSpinnerDirective,
    MenuCardComponent,
    RangeTimePickerComponent,
    PageContentComponent,
    PageHeaderComponent,
    UploadComponent,
  ],
  imports: [MaterialModule, CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  exports: [
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    CommonModule,
    ListItemComponent,
    ButtonSpinnerDirective,
    MenuCardComponent,
    RangeTimePickerComponent,
    PageContentComponent,
    PageHeaderComponent,
    UploadComponent,
  ],
  entryComponents: [MatSpinner],
})
export class SharedModule {}
