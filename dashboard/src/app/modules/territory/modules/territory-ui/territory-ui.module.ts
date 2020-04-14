import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '~/shared/modules/material/material.module';
import { FormModule } from '~/shared/modules/form/form.module';
import { SharedModule } from '~/shared/shared.module';
import { DetailsModule } from '~/shared/modules/details/details.module';

import { TerritoryFormComponent } from './components/territory-form/territory-form.component';
// eslint-disable-next-line
import { TerritoriesAutocompleteComponent } from './components/territories-autocomplete/territories-autocomplete.component';
import { TerritoryAutocompleteComponent } from './components/territory-autocomplete/territory-autocomplete.component';
import { TerritoryListComponent } from './components/territory-list/territory-list.component';
import { TerritoryFilterComponent } from './components/territory-filter/territory-filter.component';
import { TerritoryListViewComponent } from './components/territory-list-view/territory-list-view.component';
import { TerritoryViewComponent } from './components/territory-view/territory-view.component';
import { TerritoryDetailsComponent } from './components/territory-details/territory-details.component';
import { TerritoryChildrenComponent } from './components/territory-children/territory-children.component';

// eslint-disable-next-line
import { TerritorySelectionBlockComponent } from './components/territory-selection-block/territory-selection-block.component';

// eslint-disable-next-line
import { TerritorySelectionGroupComponent } from './components/territory-selection-group/territory-selection-group.component';

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
    TerritoryChildrenComponent,
    TerritorySelectionBlockComponent,
    TerritorySelectionGroupComponent,
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
  ],
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
