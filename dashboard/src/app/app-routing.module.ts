import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from '~/layout/main/component';

import { AuthGuard } from './applicativeService/authguard/service';
import { DeclarationComponent } from './main/pages/declaration/component';
import { HomeComponent } from './modules/home/pages/home/component';
import { IncitationsComponent } from './main/pages/incitations/component';

const routes: Routes = [

  { path: 'dashboard', component: LayoutComponent, canActivate: [AuthGuard],
    children: [
          { path : 'declaration', component: DeclarationComponent, data: { groups: ['operators', 'registry'] } },
          { path : 'incitations', component: IncitationsComponent, data: { groups: ['operators', 'registry'] } },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
