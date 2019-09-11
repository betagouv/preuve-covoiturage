// tslint:disable:variable-name

import { Territory } from '~/core/entities/territory/territory';
import {
  CampaignInterface,
  IncentiveFormulaInterface,
  RestrictionInterface,
} from '~/core/interfaces/campaign/campaignInterface';
import { IncentiveRules } from '~/core/entities/campaign/incentive-rules';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { IncentiveFormula } from '~/core/entities/campaign/incentive-formula';

export class Campaign {
  public _id: string;
  public name: string;
  public description: string;
  public start: Date;
  public end: Date;
  public status: CampaignStatusEnum;
  public template_id: string;
  public max_trips: number;
  public max_amount: number;
  public amount_unit: IncentiveUnitEnum;
  public rules: IncentiveRules;
  public restrictions: RestrictionInterface[];
  public formula_expression;
  public formulas: IncentiveFormula[];
  public expertMode: boolean;
  public territory?: Territory;
  public trips_number?: number;
  public amount_spent?: number;

  constructor(
    obj: CampaignInterface = {
      _id: null,
      name: '',
      description: '',
      amount_unit: null,
      start: null,
      end: null,
      status: null,
      template_id: null,
      max_trips: null,
      max_amount: null,
      rules: {
        weekday: [],
        time: [],
        range: [0, 0],
        ranks: [],
        onlyAdult: null,
        forDriver: null,
        forPassenger: null,
        forTrip: null,
        operatorIds: [],
      },
      restrictions: [],
      formula_expression: '',
      formulas: [],
      expertMode: false,
    },
  ) {
    this._id = obj._id;
    this.name = obj.name;
    this.description = obj.description;
    this.start = obj.start;
    this.end = obj.end;
    this.status = obj.status;
    this.template_id = obj.template_id;
    this.max_trips = obj.max_trips;
    this.max_amount = obj.max_amount;
    this.amount_unit = obj.amount_unit;
    this.amount_unit = obj.amount_unit;
    this.amount_spent = obj.amount_spent;
    this.rules = obj.rules;
    this.restrictions = obj.restrictions;
    this.formula_expression = obj.formula_expression;
    this.formulas = obj.formulas;
    this.expertMode = obj.expertMode;
    if (obj.territory) {
      this.territory = obj.territory;
    }
    if (obj.trips_number) {
      this.trips_number = obj.trips_number;
    }
    if (obj.amount_spent) {
      this.amount_spent = obj.amount_spent;
    }
  }
}
