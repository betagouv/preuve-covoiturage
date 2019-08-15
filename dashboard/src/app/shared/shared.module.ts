import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSpinner } from '@angular/material';
import { RouterModule } from '@angular/router';

import { MaterialModule } from './material/material.module';

import { ButtonSpinnerDirective } from './directives/button-spinner.directive';

import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { HelpCardComponent } from './components/help-card/help-card.component';
import { ListItemComponent } from './components/list-item/list-item.component';
import { MenuCardComponent } from './components/menu-card/menu-card.component';

@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    ListItemComponent,
    ButtonSpinnerDirective,
    MenuCardComponent,
  ],
  imports: [MaterialModule, CommonModule, RouterModule],
  exports: [
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    CommonModule,
    ListItemComponent,
    ButtonSpinnerDirective,
    MenuCardComponent,
  ],
  entryComponents: [MatSpinner],
})
export class SharedModule {}
