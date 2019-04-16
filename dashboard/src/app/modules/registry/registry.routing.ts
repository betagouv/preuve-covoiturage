import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistryJourneyImportComponent } from './pages/journeyImport/component';

const routes: Routes = [
  {
    path : 'journey-import',
    component: RegistryJourneyImportComponent,
    data: { groups: ['registry'] },
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

export class RegistryRoutingModule { }
