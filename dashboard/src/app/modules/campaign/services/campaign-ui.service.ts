import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { CurrencyPipe, DecimalPipe, WeekDay } from '@angular/common';
import * as moment from 'moment';

import {
  RestrictionUxInterface,
  RetributionUxInterface,
} from '~/core/interfaces/campaign/ux-format/campaign-ux.interface';
import { INCENTIVE_UNITS_FR, IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { IncentiveTimeRuleUxInterface } from '~/core/entities/campaign/ux-format/incentive-filters';
import { CAMPAIGN_RULES_MAX_DISTANCE_KM } from '~/core/const/campaign/rules.const';
import { RulesRangeUxType } from '~/core/types/campaign/rulesRangeInterface';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';

// todo: remove this duplicate
enum RestrictionPeriodsEnum {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'campaign',
}

// todo: remove this duplicate
const RESTRICTION_PERIODS: RestrictionPeriodsEnum[] = Object.values(RestrictionPeriodsEnum);

// todo: remove this duplicate
const RESTRICTION_PERIODS_FR = {
  [RestrictionPeriodsEnum.DAY]: 'jour',
  [RestrictionPeriodsEnum.MONTH]: 'mois',
  [RestrictionPeriodsEnum.YEAR]: 'année',
  [RestrictionPeriodsEnum.ALL]: 'durée de la campagne',
};

/*
 * Human readible definitions of campaign rules.
 * */
@Injectable({
  providedIn: 'root',
})
export class CampaignUiService {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  public retributions(campaign: CampaignUx): string {
    const retributions: RetributionUxInterface[] = campaign.retributions;
    const unit: IncentiveUnitEnum = campaign.unit;
    const uiStatus: UiStatusInterface = campaign.ui_status;

    let text = '';
    for (const retribution of retributions) {
      const valueForDriver = retribution.for_driver.amount;
      const valueForPassenger = retribution.for_passenger.amount;
      const perKmForDriver = retribution.for_driver.per_km;
      const perKmForPassenger = retribution.for_passenger.per_km;
      const free = retribution.for_passenger.free;
      const perPassenger = retribution.for_driver.per_passenger;
      const min = retribution.min;
      const max = retribution.max;
      if (!valueForDriver && !valueForPassenger && !free) {
        continue;
      }
      text += `<br/>\r\n&nbsp&nbsp&nbsp&nbsp `;

      // CONDUCTEUR
      if (valueForDriver && (uiStatus.for_trip || uiStatus.for_driver)) {
        // tslint:disable-next-line:max-line-length
        text += ` ${valueForDriver} ${INCENTIVE_UNITS_FR[unit]} par trajet`;
        text += perKmForDriver ? ' par km' : '';
        text += perPassenger ? ' par passager' : '';
        if (!uiStatus.for_trip) {
          text += ' pour le conducteur';
        }
      }
      text += valueForDriver && valueForPassenger ? ', ' : '';

      // PASSAGERS
      if (uiStatus.for_trip || uiStatus.for_passenger) {
        if (free) {
          text += ' gratuit pour le(s) passager(s)';
        } else if (valueForPassenger !== null) {
          text += ` ${valueForPassenger} ${INCENTIVE_UNITS_FR[unit]} par trajet`;
          text += perKmForPassenger ? ' par km' : '';
          text += ` pour le(s) passager(s)`;
        }
      }
      if (min || max) {
        if (!max) {
          text += ` à partir de ${min} km`;
        } else {
          text += ` de ${min} à ${max} km`;
        }
      }
      text += `.`;
    }
    text += `<br/>\r\n`;
    return text;
  }

  public daysAndTimes(weekDays: WeekDay[] = [], timeRanges: IncentiveTimeRuleUxInterface[] = []): string {
    if (weekDays.length === 0) {
      return '';
    }
    let text = '';
    text += weekDays
      .map((weekDay: WeekDay) =>
        moment()
          .isoWeekday(weekDay + 1)
          .format('dddd'),
      )
      .join(', ');

    if (timeRanges && timeRanges.length > 0) {
      if (weekDays.length > 0) {
        text += ' <br>';
      }
      text += ' De ';
      text += timeRanges
        .map((timeRange: IncentiveTimeRuleUxInterface) => {
          if (!timeRange || !timeRange.start || !timeRange.end) {
            return '';
          }
          return `${timeRange.start.replace(':', 'h')} à ${timeRange.end.replace(':', 'h')}`;
        })
        .join(', ');
    }
    return text;
  }

  public ranks(ranks: TripRankEnum[]): string {
    return ranks.join(', ');
  }

  public targets(forDriver: boolean, forPassenger: boolean, forTrip: boolean, onlyAdult: boolean): string {
    if (!(forDriver || forPassenger || forTrip)) {
      return '';
    }
    let label = '';
    if (forDriver) {
      label += 'Conducteurs';
    }
    if (forPassenger) {
      label += forDriver ? ' et passagers' : 'Passagers';
      if (onlyAdult) {
        label += ', majeurs uniquement';
      }
    }
    if (forTrip) {
      label += 'Trajets';
      if (onlyAdult) {
        label += ', passagers majeurs uniquement';
      }
    }
    return label;
  }

  public distance(range: RulesRangeUxType): string {
    if (range && (range.length < 2 || range === [0, 0])) {
      return '';
    }
    if (range[1] >= CAMPAIGN_RULES_MAX_DISTANCE_KM) {
      return `A partir de ${range[0]} km`;
    }
    if (range[0] < 1) {
      return `Jusqu'à ${range[1]} km`;
    }
    return `De ${range[0]} à ${range[1]} km`;
  }

  public insee(): string {
    return '';
  }

  public restrictions(restrictions: RestrictionUxInterface[]) {
    if (restrictions.length === 0) {
      return 'Aucune restriction.';
    }
    let text = '';
    restrictions.forEach((restriction: RestrictionUxInterface) => {
      text += `<br/>\r\n&nbsp&nbsp&nbsp&nbsp `;
      text += `${restriction.quantity} trajets maximum pour le ${restriction.is_driver ? 'conducteur' : 'passager'} `;

      switch (restriction.period) {
        // @ts-ignore
        case RestrictionPeriodsEnum.DAY:
          text += 'par jour.';
          break;
        // @ts-ignore
        case RestrictionPeriodsEnum.MONTH:
          text += 'par mois.';
          break;
        // @ts-ignore
        case RestrictionPeriodsEnum.YEAR:
          text += 'sur une année.';
          break;
        // @ts-ignore
        case RestrictionPeriodsEnum.ALL:
          text += 'sur toute la durée de la campagne.';
          break;
      }

      text += ',';
    });
    return text;
  }

  public summary(campaign: CampaignUx): string {
    const unit = campaign.unit;

    let summaryText = `Campagne d’incitation au covoiturage du <b>`;

    // DATE
    summaryText += ` ${moment(campaign.start).format('dddd DD MMMM YYYY')} au`;
    summaryText += ` ${moment(campaign.end).format('dddd DD MMMM YYYY')}</b>, limitée à`;

    // MAXIMUM AMOUNT
    switch (unit) {
      case IncentiveUnitEnum.EUR:
        summaryText += ` <b>${new CurrencyPipe(this.locale).transform(
          campaign.max_amount,
          'EUR',
          'symbol',
          '1.0-0',
        )}</b>.`;
        break;
      case IncentiveUnitEnum.POINT:
        summaryText += ` <b>${new DecimalPipe(this.locale).transform(campaign.max_amount, '1.0-0', 'FR')} points</b>.`;
        break;
    }
    summaryText += '<br/><br/>\r\n\r\n';

    // TARGET
    summaryText += `Sont rémunérés les <b>`;
    summaryText += ` ${
      campaign.ui_status.for_driver && campaign.ui_status.for_passenger
        ? 'conducteurs et passagers'
        : campaign.ui_status.for_driver
        ? 'conducteurs'
        : 'passagers'
    }`;

    // ONLY ADULT
    summaryText += ` ${campaign.only_adult ? 'majeurs' : ''}</b>`;

    // DISTANCE
    summaryText += ` effectuant un trajet`;
    if (campaign.filters.distance_range[1] > 99) {
      summaryText += ` d'au moins ${campaign.filters.distance_range[0]} km`;
    } else if (campaign.filters.distance_range[0] < 1) {
      summaryText += ` d'au plus ${campaign.filters.distance_range[1]} km`;
    } else {
      summaryText += ` compris entre ${campaign.filters.distance_range[0]} à ${campaign.filters.distance_range[1]} km`;
    }
    summaryText += ` à raison de : `;

    // RETRIBUTIONS
    summaryText += '<br/><br/>\r\n\r\n';
    summaryText += `${this.retributions(campaign)}`;
    summaryText += '<br/><br/>\r\n\r\n';

    if (campaign.restrictions.length > 0) {
      summaryText += 'Les restrictions suivantes seront appliquées :';

      // RESTRICTIONS
      summaryText += '<br/><br/>\r\n\r\n';
      summaryText += `${this.restrictions(campaign.restrictions)}`;
      summaryText += '<br/><br/>\r\n\r\n';
    }

    // RANKS
    summaryText += `L’opération est limitée aux opérateurs proposant des preuves de classe`;
    summaryText += ` <b>${campaign.filters.rank ? campaign.filters.rank.join(' ou ') : ''}</b>.`;
    summaryText += '<br/><br/>\r\n\r\n';

    return summaryText;
  }
}
