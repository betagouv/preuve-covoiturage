import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotAuthenticatedLayoutComponent } from './core/components/not-authenticated-layout/not-authenticated-layout.component';
import { AuthenticatedLayoutComponent } from './core/components/authenticated-layout/authenticated-layout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    children: [
      {
        path: 'admin',
        loadChildren: () =>
          import('./modules/administration/administration.module').then((mod) => mod.AdministrationModule),
      },
      {
        path: 'ui-guide',
        loadChildren: () => import('./modules/ui-guide/ui-guide.module').then((mod) => mod.UiGuideModule),
      },
    ],
  },
  {
    path: '',
    component: NotAuthenticatedLayoutComponent,
    children: [
      {
        path: 'login',
        loadChildren: () =>
          import('./modules/authentication/authentication.module').then((mod) => mod.AuthenticationModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
