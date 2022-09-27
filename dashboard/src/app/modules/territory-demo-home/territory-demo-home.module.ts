import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerritoryDemoHomeComponent } from './territory-demo-home/territory-demo-home.component';
import { TerritoryDemoRoutingModule } from './territory-demo-home-routing.module';

@NgModule({
  declarations: [TerritoryDemoHomeComponent],
  imports: [CommonModule, TerritoryDemoRoutingModule],
})
export class TerritoryDemoHomeModule {}
