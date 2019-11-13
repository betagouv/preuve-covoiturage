import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PublicStatComponent } from '~/modules/stat/pages/public-stat/public-stat.component';

const routes: Routes = [
  {
    path: 'stats',
    component: PublicStatComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatRoutingModule {}
