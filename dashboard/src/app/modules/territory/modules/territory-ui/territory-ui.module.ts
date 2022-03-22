import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DetailsModule } from '../../../../shared/modules/details/details.module';
import { FormModule } from '../../../../shared/modules/form/form.module';
import { MaterialModule } from '../../../../shared/modules/material/material.module';
import { TerritoriesToInseesAutocompleteComponent } from '../../../../shared/modules/territory-to-insees-autocomplete/components/territories-to-insees-autocomplete/territories-to-insees-autocomplete.component';
import { TerritoryToInseesAutocompleteModule } from '../../../../shared/modules/territory-to-insees-autocomplete/territory-to-insees-autocomplete.module';
import { SharedModule } from '../../../../shared/shared.module';
// eslint-disable-next-line
import { TerritoriesAutocompleteComponent } from './components/territories-autocomplete/territories-autocomplete.component';
import { TerritoryDetailsComponent } from './components/territory-details/territory-details.component';
import { TerritoryFilterComponent } from './components/territory-filter/territory-filter.component';
import { TerritoryFormComponent } from './components/territory-form/territory-form.component';
import { TerritoryListViewComponent } from './components/territory-list-view/territory-list-view.component';
import { TerritoryListComponent } from './components/territory-list/territory-list.component';
import { TerritoryUiRoutingModule } from './territory-ui-routing.module';

@NgModule({
  declarations: [
    TerritoryFormComponent,
    TerritoriesAutocompleteComponent,
    TerritoryListComponent,
    TerritoryFilterComponent,
    TerritoryListViewComponent,
    TerritoryDetailsComponent,
    // TerritoriesToInseesAutocompleteComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    FormModule,
    SharedModule,
    DetailsModule,
    MatPaginatorModule,
    TerritoryUiRoutingModule,
    // TerritoriesToInseesAutocompleteComponent,
    TerritoryToInseesAutocompleteModule,
  ],
  exports: [
    TerritoryFormComponent,
    TerritoriesAutocompleteComponent,
    TerritoryListComponent,
    TerritoryListViewComponent,
    TerritoryDetailsComponent,
  ],
})
export class TerritoryUiModule {}
