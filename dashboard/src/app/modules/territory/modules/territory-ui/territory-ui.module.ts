import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '~/shared/modules/material/material.module';
import { FormModule } from '~/shared/modules/form/form.module';
import { SharedModule } from '~/shared/shared.module';
import { DetailsModule } from '~/shared/modules/details/details.module';

import { TerritoryFormComponent } from './components/territory-form/territory-form.component';
// tslint:disable-next-line:max-line-length
import { TerritoriesAutocompleteComponent } from './components/territories-autocomplete/territories-autocomplete.component';
import { TerritoryAutocompleteComponent } from './components/territory-autocomplete/territory-autocomplete.component';
import { TerritoryListComponent } from './components/territory-list/territory-list.component';
import { TerritoryFilterComponent } from './components/territory-filter/territory-filter.component';
import { TerritoryListViewComponent } from './components/territory-list-view/territory-list-view.component';
import { TerritoryViewComponent } from './components/territory-view/territory-view.component';
import { TerritoryDetailsComponent } from './components/territory-details/territory-details.component';

@NgModule({
  declarations: [
    TerritoryFormComponent,
    TerritoriesAutocompleteComponent,
    TerritoryAutocompleteComponent,
    TerritoryListComponent,
    TerritoryFilterComponent,
    TerritoryListViewComponent,
    TerritoryViewComponent,
    TerritoryDetailsComponent,
  ],
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule, FormModule, SharedModule, DetailsModule],
  exports: [
    TerritoryFormComponent,
    TerritoriesAutocompleteComponent,
    TerritoryAutocompleteComponent,
    TerritoryListComponent,
    TerritoryListViewComponent,
    TerritoryViewComponent,
    TerritoryDetailsComponent,
  ],
})
export class TerritoryUiModule {}
