import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UiGuideComponent } from './ui-guide.component';

const routes: Routes = [
  {
    path: '',
    component: UiGuideComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UiGuideRoutingModule {}
