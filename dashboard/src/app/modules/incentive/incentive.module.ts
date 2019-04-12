/* Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/* External modules */
import { TabMenuModule } from 'primeng/tabmenu';
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { CalendarModule } from 'primeng/calendar';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { OrderListModule } from 'primeng/orderlist';
import { TableModule } from 'primeng/table';
import {
  DialogService,
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';

/* Shared modules */
import { FormModule } from '~/shared/modules/form/form.module';
import { GraphicModule } from '~/shared/modules/graphic/graphic.module';
import { IncentiveCampaignConfirmationComponent } from '~/modules/incentive/components/campaign/confirmation/component';
import { IncentiveCampaignsListPageComponent } from '~/modules/incentive/pages/campaigns/list/component';
import { IncentiveCampaignSummaryComponent } from '~/modules/incentive/components/campaign/summary/component';

/* Local modules */
import { IncentiveRoutingModule } from './incentive.routing';
/* Local components */
import { IncentivePoliciesCreatePageComponent } from './pages/policies/create/component';
import { IncentivePoliciesListPageComponent } from './pages/policies/list/component';
import { IncentiveCampaignsCreatePageComponent } from './pages/campaigns/create/component';
import { IncentiveParameterFormComponent } from './components/parameters/form/component';
import { IncentiveParameterCreationComponent } from './components/parameters/creation/component';
import { IncentiveUnitPickerComponent } from './components/units/picker/component';
import { IncentiveUnitCreationComponent } from './components/units/creation/component';
import { IncentiveFormulaFormComponent } from './components/formula/form/component';
import { IncentiveFilterFormComponent } from './components/filters/form/component';
import { IncentiveWeekdayFilterComponent } from './components/filters/weekday/component';
import { IncentiveTimeFilterComponent } from './components/filters/time/component';
import { IncentiveRangeFilterComponent } from './components/filters/range/component';
import { IncentiveRankFilterComponent } from './components/filters/rank/component';
import { IncentivePolicyPanelComponent } from './components/policy/panel/component';
import { IncentivePolicyGeneralFormComponent } from './components/policy/form/component';
import { IncentivePolicySummaryComponent } from './components/policy/summary/component';
import { IncentivePolicyConfirmationComponent } from './components/policy/confirmation/component';
import { IncentivePolicyPickerComponent } from './components/policy/picker/component';
/* Local directives */
import { FormulaValidatorDirective } from './directives/formulaValidator/directive';
/* Local services */
import { IncentiveCampaignService } from './services/incentiveCampaignService';
import { IncentiveFilterService } from './services/incentiveFilterService';
import { IncentiveParameterService } from './services/incentiveParameterService';
import { IncentivePolicyService } from './services/incentivePolicyService';
import { IncentiveUnitService } from './services/incentiveUnitService';
import { TranslationService } from '~/shared/services/translationService';
import { TableService } from '~/shared/services/tableService';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FormModule,
    DynamicDialogModule,
    InputTextareaModule,
    TabMenuModule,
    CardModule,
    ButtonModule,
    CalendarModule,
    SliderModule,
    StepsModule,
    InputTextModule,
    OrderListModule,
    GraphicModule,
    CheckboxModule,
    RatingModule,
    TriStateCheckboxModule,
    IncentiveRoutingModule,
    MessageModule,
    SelectButtonModule,
    TableModule,
  ],
  providers: [
    DialogService,
    DynamicDialogRef,
    DynamicDialogConfig,
    IncentiveParameterService,
    IncentivePolicyService,
    IncentiveCampaignService,
    IncentiveFilterService,
    IncentiveUnitService,
    TranslationService,
    TableService,
  ],
  declarations: [
    IncentiveCampaignsCreatePageComponent,
    IncentivePoliciesCreatePageComponent,
    IncentivePoliciesListPageComponent,
    IncentivePolicySummaryComponent,
    IncentiveParameterFormComponent,
    IncentivePolicyPanelComponent,
    IncentiveUnitPickerComponent,
    IncentiveUnitCreationComponent,
    IncentiveParameterCreationComponent,
    IncentiveFilterFormComponent,
    IncentiveWeekdayFilterComponent,
    IncentiveTimeFilterComponent,
    IncentiveRangeFilterComponent,
    IncentiveRankFilterComponent,
    IncentiveFormulaFormComponent,
    FormulaValidatorDirective,
    IncentivePolicyGeneralFormComponent,
    IncentivePolicyConfirmationComponent,
    IncentivePolicyPickerComponent,
    IncentiveCampaignConfirmationComponent,
    IncentiveCampaignsListPageComponent,
    IncentiveCampaignSummaryComponent,
  ],
  entryComponents: [
    IncentivePolicyPanelComponent,
    IncentiveUnitCreationComponent,
    IncentiveParameterCreationComponent,
    IncentiveWeekdayFilterComponent,
    IncentiveTimeFilterComponent,
    IncentiveRangeFilterComponent,
    IncentiveRankFilterComponent,
    IncentivePolicyConfirmationComponent,
    IncentivePolicyPickerComponent,
    IncentiveCampaignConfirmationComponent,
    IncentiveCampaignSummaryComponent,
  ],
  exports: [
    IncentivePolicySummaryComponent,
    IncentiveParameterFormComponent,
    IncentiveUnitPickerComponent,
    IncentiveFilterFormComponent,
    IncentiveFormulaFormComponent,
    FormulaValidatorDirective,
    IncentivePolicyGeneralFormComponent,
    IncentiveCampaignSummaryComponent,
  ],
})
export class IncentiveModule { }
