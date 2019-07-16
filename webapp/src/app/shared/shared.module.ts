import { NgModule } from '@angular/core';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { MaterialModule } from './material/material.module';
import { HelpCardComponent } from './components/help-card/help-card.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [FooterComponent, HeaderComponent, HelpCardComponent],
  imports: [MaterialModule, CommonModule],
  exports: [FooterComponent, HeaderComponent, HelpCardComponent, CommonModule],
})
export class SharedModule {}
