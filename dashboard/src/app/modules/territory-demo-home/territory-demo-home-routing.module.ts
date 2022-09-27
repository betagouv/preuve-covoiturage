import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TerritoryDemoHomeComponent } from './territory-demo-home/territory-demo-home.component';

const routes: Routes = [
  {
    path: '',
    component: TerritoryDemoHomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TerritoryDemoRoutingModule {}
