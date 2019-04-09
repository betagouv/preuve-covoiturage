import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StatisticsPageComponent } from './pages/statistics/component';


const routes: Routes = [
  { path: '', component: StatisticsPageComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})

export class StatisticsRoutingModule { }
