import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { WeekDay } from '@angular/common';

import {
  RestrictionUxInterface,
  RetributionUxInterface,
} from '~/core/interfaces/campaign/ux-format/campaign-ux.interface';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import {
  IncentiveFiltersUxInterface,
  IncentiveTimeRuleUxInterface,
} from '~/core/entities/campaign/ux-format/incentive-filters';
import { CAMPAIGN_RULES_MAX_DISTANCE_KM } from '~/core/const/campaign/rules.const';
import { RulesRangeUxType } from '~/core/types/campaign/rulesRangeInterface';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { DAYS } from '~/core/const/days.const';
import { RestrictionUnitEnum } from '~/core/enums/campaign/restrictions.enum';
import { CommonDataService } from '~/core/services/common-data.service';

// todo: remove this duplicate
enum RestrictionPeriodsEnum {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  ALL = 'campaign',
}

/*
 * Human readible definitions of campaign rules.
 * */
@Injectable({
  providedIn: 'root',
})
export class CampaignUiService {
  public days: WeekDay[] = [1, 2, 3, 4, 5, 6, 0];

  constructor(@Inject(LOCALE_ID) private locale: string, private commonData: CommonDataService) {}

  public retributions(campaign: CampaignUx): string {
    const retributions: RetributionUxInterface[] = campaign.retributions;
    const uiStatus: UiStatusInterface = campaign.ui_status;

    const unit = (amount: number, unit: string): string => `${unit}${amount > 1 ? 's' : ''}`;

    let text = '';
    for (const retribution of retributions) {
      const valueForDriver = retribution.for_driver.amount;
      const valueForPassenger = retribution.for_passenger.amount;
      const perKmForDriver = retribution.for_driver.per_km;
      const perKmForPassenger = retribution.for_passenger.per_km;
      const free = retribution.for_passenger.free;
      const perPassenger = retribution.for_driver.per_passenger;
      const min = retribution.min ? retribution.min : 0;
      const max = retribution.max ? retribution.max : 0;
      if (!valueForDriver && !valueForPassenger && !free) {
        continue;
      }
      text += `<li><b>`;

      if (min || max) {
        if (!max || max >= CAMPAIGN_RULES_MAX_DISTANCE_KM) {
          text += `À partir de ${min} km : `;
        } else {
          text += `De ${min} à ${max} km : `;
        }
      }

      // CONDUCTEUR
      if (valueForDriver && uiStatus.for_driver) {
        // tslint:disable-next-line:max-line-length
        text += ` ${valueForDriver} ${unit(valueForDriver, campaign.unit)} par trajet`;
        text += perKmForDriver ? ' par km' : '';
        text += perPassenger ? ' par passager' : '';
        if (!uiStatus.for_trip) {
          text += ' pour le conducteur';
        }
      }
      // text += uiStatus.for_driver && uiStatus.for_passenger ? ', ' : '';

      // PASSAGERS
      if ((valueForPassenger || free) && uiStatus.for_passenger) {
        if (free) {
          text += ' gratuit pour le(s) passager(s)';
        } else if (valueForPassenger !== null) {
          text += ` ${valueForPassenger} ${unit(valueForPassenger, campaign.unit)} par trajet`;
          text += perKmForPassenger ? ' par km' : '';
          text += ` pour le(s) passager(s)`;
        }
      }

      // TRAJET
      if (uiStatus.for_trip) {
        // tslint:disable-next-line:max-line-length
        text += ` ${valueForDriver} ${unit(valueForDriver, campaign.unit)} par trajet`;
        text += perKmForDriver ? ' par km' : '';
        text += perPassenger ? ' par passager' : '';
      }

      text += `.</li></b>`;
    }
    return text;
  }

  public formatWeekDays(weekDays: WeekDay[]): string {
    if (weekDays.length === 0) {
      return '';
    }

    return this.days
      .filter((dInd) => weekDays.indexOf(dInd) !== -1)
      .map((weekDay) => DAYS[weekDay])
      .join(', ');
  }

  public formatWeekTime(timeRanges: IncentiveTimeRuleUxInterface[]): string {
    let text = '';

    if (timeRanges && timeRanges.length > 0) {
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

  public daysAndTimes(
    weekDays: WeekDay[] = [],
    timeRanges: IncentiveTimeRuleUxInterface[] = [],
    dayTimeSeparator = '<br>',
  ): string {
    const days = `${this.formatWeekDays(weekDays)}${weekDays.length ? dayTimeSeparator : ''}${this.formatWeekTime(
      timeRanges,
    ).toLowerCase()}`;
    return days.charAt(0).toUpperCase() + days.slice(1);
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

  public insee(insee: IncentiveFiltersUxInterface['insee']): string {
    let text = '';
    if (insee.blackList && insee.blackList.length > 0) {
      text += `Les axes suivants ne sont pas incités : <ul>`;

      insee.blackList.forEach((axe) => {
        text += '<li>';
        if (axe.start.length > 0) {
          if (axe.end.length > 0) {
            text += `De `;
          } else {
            text += `En partance de `;
          }
        }

        axe.start.forEach((city, index) => {
          if (index > 0 && index === axe.start.length - 1) {
            text += ' ou ';
          } else if (index > 0) {
            text += ', ';
          }
          text += `<b>${city.territory_literal}</b>`;
        });

        if (axe.end.length > 0) {
          if (axe.start.length > 0) {
            text += ` à `;
          } else {
            text += `A destination de `;
          }
        }

        axe.end.forEach((city, index) => {
          if (index > 0 && index === axe.end.length - 1) {
            text += ' ou ';
          } else if (index > 0) {
            text += ', ';
          }
          text += `<b>${city.territory_literal}</b>`;
        });
        text += `.</li>`;
      });
    } else if (insee.whiteList && insee.whiteList.length > 0) {
      text += `Les trajets incités doivent être sur les axes suivants : <ul>`;

      insee.whiteList.forEach((axe) => {
        text += '<li>';
        if (axe.start.length > 0) {
          if (axe.end.length > 0) {
            text += `De `;
          } else {
            text += `En partance de `;
          }
        }

        axe.start.forEach((city, index) => {
          if (index > 0 && index === axe.start.length - 1) {
            text += ' ou ';
          } else if (index > 0) {
            text += ', ';
          }
          text += `<b>${city.territory_literal}</b>`;
        });

        if (axe.end.length > 0) {
          if (axe.start.length > 0) {
            text += ` à `;
          } else {
            text += `A destination de `;
          }
        }
        axe.end.forEach((city, index) => {
          if (index > 0 && index === axe.end.length - 1) {
            text += ' ou ';
          } else if (index > 0) {
            text += ', ';
          }
          text += `<b>${city.territory_literal}</b>`;
        });
        text += `.</li>`;
      });
    }

    return text;
  }

  public restriction(restriction: RestrictionUxInterface, amountUnit: string): string {
    let text = '';
    const unit = (amount: number): string =>
      (restriction.unit === RestrictionUnitEnum.TRIP ? 'trajet' : `${amountUnit}`) + (amount > 1 ? 's' : '');

    text += `${restriction.quantity} ${unit(restriction.quantity)} maximum pour le ${
      restriction.is_driver ? 'conducteur' : 'passager'
    } `;

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

    return text;
  }

  public restrictions(restrictions: RestrictionUxInterface[] = [], amountUnit = ''): string {
    if (restrictions.length === 0) {
      return 'Aucune restriction.';
    }
    let text = '';

    restrictions.forEach((restriction: RestrictionUxInterface, index) => {
      text += `<li><b>${this.restriction(restriction, amountUnit)}</b></li>`;
    });
    return text;
  }

  public summary(campaign: CampaignUx): string {
    const unit = campaign.unit;

    let summaryText = `<p>Campagne d’incitation au covoiturage du <b>`;

    // DATE
    summaryText += campaign.start ? ` ${campaign.start.format('dddd DD MMMM YYYY')} au` : ' au';
    summaryText += campaign.end ? ` ${campaign.end.format('dddd DD MMMM YYYY')}</b>, limitée à` : '';

    // WEEK DAYS

    if (campaign.filters.weekday && campaign.filters.weekday.length) {
      summaryText += ` ${campaign.filters.weekday.length ? `${this.formatWeekDays(campaign.filters.weekday)}` : ''}${
        campaign.filters.time.length ? `${this.formatWeekTime(campaign.filters.time)}` : ''
      }`.toLowerCase();
    }

    // MAXIMUM AMOUNT
    summaryText += `
      <p>Cette campagne est limitée à
        <b>${campaign.max_amount} ${unit}${campaign.max_amount > 1 ? 's' : ''}</b>.
      </p>
    `;

    // TARGET
    summaryText += `<p>Les <b>`;
    summaryText += ` ${
      campaign.ui_status.for_driver && campaign.ui_status.for_passenger
        ? 'conducteurs et passagers'
        : campaign.ui_status.for_driver
        ? 'conducteurs'
        : campaign.ui_status.for_passenger
        ? 'passagers'
        : 'covoiturages'
    }`;

    // ONLY ADULT
    summaryText += ` ${campaign.only_adult ? 'majeurs' : ''}</b>`;

    // DISTANCE
    if (campaign.filters.distance_range[0] > 0 || campaign.filters.distance_range[1] < CAMPAIGN_RULES_MAX_DISTANCE_KM) {
      summaryText += ` effectuant un trajet`;
      if (campaign.filters.distance_range[1] === CAMPAIGN_RULES_MAX_DISTANCE_KM) {
        summaryText += ` d'au moins ${campaign.filters.distance_range[0]} km`;
      } else if (
        campaign.filters.distance_range[0] === 0 &&
        campaign.filters.distance_range[1] < CAMPAIGN_RULES_MAX_DISTANCE_KM
      ) {
        summaryText += ` d'au plus ${campaign.filters.distance_range[1]} km`;
      } else {
        summaryText +=
          ` compris entre ${campaign.filters.distance_range[0]}` + ` à ${campaign.filters.distance_range[1]} km`;
      }
    }
    summaryText += ` sont incités selon les règles suivantes : </p>`;

    // RETRIBUTIONS
    summaryText += `<ul>${this.retributions(campaign)}</ul>`;

    if (campaign.restrictions.length > 0 && campaign.restrictions[0].quantity) {
      summaryText += '<p>Les restrictions suivantes seront appliquées :</p>';

      // RESTRICTIONS
      summaryText += `<ul>${this.restrictions(campaign.restrictions, campaign.unit)}</ul>`;
    }

    // OPERATORS & RANKS
    summaryText += '<p>La campagne ';

    // OPERATORS
    if (!campaign.filters.operator_ids.length) {
      summaryText += ` est ouverte à tous les opérateurs présents sur le territoire, `;
    } else {
      summaryText += `est limitée  ${
        campaign.filters.operator_ids.length === 1 ? "à l'opérateur " : 'aux opérateurs '
      } `;
      summaryText +=
        this.commonData.operators
          .filter((operator) => campaign.filters.operator_ids.indexOf(operator._id) !== -1)
          .map((operator) => operator.name)
          .join(', ') + ' ';
    }

    // RANKS
    summaryText += `proposant des preuves de classe`;
    summaryText += ` <b>${campaign.filters.rank ? campaign.filters.rank.join(' ou ') : ''}</b>.</p>`;

    // TRAJETS
    if (campaign.filters.insee) {
      summaryText += `<p>${this.insee(campaign.filters.insee)}</p>`;
    }

    return summaryText;
  }
}
