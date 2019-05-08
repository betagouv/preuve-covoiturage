import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OperatorListComponent } from './pages/list/component';
import { OperatorSettingsComponent } from './pages/settings/component';
import { OperatorJourneyImportComponent } from './pages/journeyImport/component';
import { OperatorTokenPageComponent } from './pages/token/component';

const routes: Routes = [
  {
    path: 'admin',
    component: OperatorListComponent,
    data: { groups: ['registry'] },
  },
  {
    path: 'tokens',
    component: OperatorTokenPageComponent,
    data: { groups: ['operators'] },
  },
  {
    path : 'settings',
    component: OperatorSettingsComponent,
    data: { groups: ['operators'] },
  },
  {
    path : 'journey-import',
    component: OperatorJourneyImportComponent,
    data: { groups: ['operators'] },
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

export class OperatorRoutingModule { }
