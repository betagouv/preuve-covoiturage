import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSpinner } from '@angular/material';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { MaterialModule } from './material/material.module';
import { HelpCardComponent } from './components/help-card/help-card.component';
import { ListItemComponent } from './components/list-item/list-item.component';
import { ButtonSpinnerDirective } from './directives/button-spinner.directive';
import { StatCardComponent } from './components/stat-card/stat-card.component';

@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    ListItemComponent,
    ButtonSpinnerDirective,
    StatCardComponent,
  ],
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule,
  ],
  exports: [
    FooterComponent,
    HeaderComponent,
    HelpCardComponent,
    CommonModule,
    ListItemComponent,
    ButtonSpinnerDirective,
    StatCardComponent,
  ],
  entryComponents: [
    MatSpinner,
  ],
})
export class SharedModule {
}
