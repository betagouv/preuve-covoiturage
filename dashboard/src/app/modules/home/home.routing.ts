import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '~/applicativeService/authguard/service';
import { LayoutComponent } from '~/layout/main/component';

import { HomeComponent } from '~/modules/home/pages/home/component';

const routes: Routes = [
  {
    path: 'dashboard/home', component: LayoutComponent, canActivate: [AuthGuard],
    children: [
      { path: '', component: HomeComponent },
    ],
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

export class HomeRoutingModule { }
