import { Injectable } from '@angular/core';

import { RetributionUxInterface } from '~/core/interfaces/campaign/ux-format/campaign-ux.interface';
import { INCENTIVE_UNITS_FR, IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';

@Injectable({
  providedIn: 'root',
})
export class CampaignSummaryService {
  public getExplanationFromRetributions(
    retributions: RetributionUxInterface[],
    unit: IncentiveUnitEnum,
    uiStatus: UiStatusInterface,
  ) {
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
      text += `<br/>\r\n- `;

      // CONDUCTEUR
      if (valueForDriver !== null && (uiStatus.for_trip || uiStatus.for_driver)) {
        // tslint:disable-next-line:max-line-length
        text += ` ${valueForDriver} ${INCENTIVE_UNITS_FR[unit]} par trajet`;
        text += perKmForDriver ? ' par km' : '';
        text += perPassenger ? ' par passager' : '';
        if (!uiStatus.for_trip) {
          text += ' pour le conducteur';
        }
      }
      text += valueForDriver !== null && valueForPassenger !== null ? ', ' : '';

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
}
