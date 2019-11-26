import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TempPublicStatsComponent } from '~/modules/stat/pages/temp-public-stats/temp-public-stats.component';

const routes: Routes = [
  {
    path: 'stats',
    component: TempPublicStatsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatRoutingModule {}
