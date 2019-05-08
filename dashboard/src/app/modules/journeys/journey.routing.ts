import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JourneyListPageComponent } from './pages/list/component';

const routes: Routes = [
  {
    path: '',
    component: JourneyListPageComponent,
    data: { groups: ['aom', 'registry'] },
  },

];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})

export class JourneyRoutingModule { }
