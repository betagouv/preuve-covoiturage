/* eslint-disable max-len */
import { provider } from '@ilos/common';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { TerritoryTripsInterface } from '../../shared/trip/common/interfaces/TerritoryTripsInterface';
import { TripSearchInterface } from '../../shared/trip/common/interfaces/TripSearchInterface';

@provider()
export class BuildResourceDescription {
  constructor(private tripRepository: TripRepositoryProvider) {}

  async call(
    tripSearchQueryParam: TripSearchInterface,
    excludedTerritories: TerritoryTripsInterface[],
  ): Promise<string> {
    const total_truncated: string = await (await this.tripRepository.searchCount(tripSearchQueryParam)).count;
    const start_deleted: number = excludedTerritories
      .filter((e) => e.start_geo_code)
      .reduce((count, value) => count + value.aggregated_trips_journeys.length, 0);
    const end_deleted: number = excludedTerritories
      .filter((e) => e.end_geo_code)
      .reduce((count, value) => count + value.aggregated_trips_journeys.length, 0);
    const total: string = await this.getTotal(tripSearchQueryParam);
    const deleted = parseInt(total) - parseInt(total_truncated);
    const intersection = deleted - start_deleted - end_deleted;
    return this.build(
      total,
      total_truncated,
      deleted,
      start_deleted,
      end_deleted,
      Math.abs(intersection),
      new Date(tripSearchQueryParam.date.start),
    );
  }

  private async getTotal(tripSearchQueryParam: TripSearchInterface): Promise<string> {
    const tripSearchQueryParamCopy: TripSearchInterface = {
      ...tripSearchQueryParam,
    };
    delete tripSearchQueryParamCopy.excluded_end_geo_code;
    delete tripSearchQueryParamCopy.excluded_start_geo_code;
    return (await this.tripRepository.searchCount(tripSearchQueryParamCopy)).count;
  }

  private build(
    total: string,
    total_truncated: string,
    deleted: number,
    start_delete: number,
    end_deleted: number,
    intersection: number,
    start_date: Date,
  ): string {
    const startDatePlus6Days: Date = new Date(start_date.valueOf());
    startDatePlus6Days.setDate(startDatePlus6Days.getDate() + 6);
    return `# Spécificités jeu de données ${startDatePlus6Days.toLocaleString('fr-FR', {
      month: 'long',
    })} ${startDatePlus6Days.getFullYear()}
Les données concernent également les trajets dont le point de départ OU d'arrivée est situé en dehors du territoire français.

* Nombre trajets collectés et validés par le registre de preuve de covoiturage **${total}**
* Nombre de trajets exposés dans le jeu de données : **${total_truncated}**
* Nombre de trajets supprimés du jeu de données : **${deleted} = ${start_delete} + ${end_deleted} - ${intersection}**
    * Nombre de trajets dont l’occurrence du code INSEE de départ est < 6 : **${start_delete}**
    * Nombre de trajets dont l’occurrence du code INSEE d'arrivée est < 6 : **${end_deleted}**
    * Nombre de trajets dont l’occurrence du code INSEE de départ ET d'arrivée est < 6 : **${intersection}**`;
  }
}
