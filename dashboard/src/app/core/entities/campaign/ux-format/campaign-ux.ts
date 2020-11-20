import { Moment } from 'moment';

// tslint:disable:variable-name
import { IncentiveFiltersUxInterface } from '~/core/entities/campaign/ux-format/incentive-filters';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import {
  CampaignUXInterface,
  RestrictionUxInterface,
  RetributionUxInterface,
} from '~/core/interfaces/campaign/ux-format/campaign-ux.interface';
import { CampaignReducedStats } from '../api-format/CampaignStats';

export class CampaignUx {
  public _id: number;
  public territory_id: number;
  public name: string;
  public description: string;
  public start: Moment;
  public end: Moment;
  public status: CampaignStatusEnum;
  public parent_id: number;
  public state?: CampaignReducedStats;
  public unit: IncentiveUnitEnum;
  public filters: IncentiveFiltersUxInterface;
  public max_amount: number;
  public max_trips: number;
  public only_adult: boolean;
  public restrictions: RestrictionUxInterface[];
  public retributions: RetributionUxInterface[];
  public passenger_seat: boolean;

  // todo: don't use ui_status in campaignUx
  public ui_status: {
    expert_mode?: boolean;
    staggered: boolean;
    insee_mode: boolean;
    for_driver: boolean;
    for_passenger: boolean;
    for_trip: boolean;
  };

  public amount_spent?: number;
  public trips_number?: number;

  constructor(
    obj: CampaignUXInterface = {
      _id: null,
      name: '',
      territory_id: null,
      description: '',
      unit: null,
      start: null,
      end: null,
      status: null,
      parent_id: null,
      only_adult: null,
      filters: {
        weekday: [0, 1, 2, 3, 4, 5, 6],
        time: [],
        distance_range: [0, 0],
        rank: [],
        operator_ids: [],
        all_operators: true,
        insee: {
          blackList: [],
          whiteList: [],
        },
      },
      passenger_seat: true,
      retributions: [],
      restrictions: [],
      max_amount: null,
      max_trips: null,
      ui_status: {
        for_driver: null,
        for_passenger: null,
        for_trip: null,
        staggered: null,
        insee_mode: null,
      },
      state: {
        amount: 0,
        trip_subsidized: 0,
        trip_excluded: 0,
      },
    },
  ) {
    this._id = obj._id;
    this.name = obj.name;
    this.description = obj.description;
    this.start = obj.start;
    this.end = obj.end;
    this.status = obj.status;
    this.parent_id = obj.parent_id;
    this.unit = obj.unit;
    this.filters = obj.filters;
    this.restrictions = obj.restrictions;
    this.retributions = obj.retributions;
    this.only_adult = obj.only_adult;
    this.ui_status = obj.ui_status;
    this.state = obj.state;

    this.max_trips = obj.max_trips;
    this.max_amount = obj.max_amount;

    if (obj.territory_id) {
      this.territory_id = obj.territory_id;
    }
    if (obj.amount_spent) {
      this.amount_spent = obj.amount_spent;
    }
    if (obj.trips_number) {
      this.trips_number = obj.trips_number;
    }
  }
}
