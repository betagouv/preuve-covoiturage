/* eslint-disable max-len */
import { provider } from '@ilos/common';
import { TerritoryTripsInterface } from '../../interfaces/TerritoryTripsInterface';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { OpenDataTripSearchInterface } from '../../shared/trip/common/interfaces/TripSearchInterface';

export interface OpenDataContextMetadata {
  queryParam: OpenDataTripSearchInterface;
  excludedTerritories: TerritoryTripsInterface[];
}

@provider()
export class HappenMarkdownDescription {
  constructor(private tripRepository: TripRepositoryProvider) {}

  async call(openDataContext: OpenDataContextMetadata, description = ''): Promise<string> {
    const total_truncated: string = await (await this.tripRepository.searchCount(openDataContext.queryParam)).count;
    const start_deleted: number = openDataContext.excludedTerritories
      .filter((e) => e.start_territory_id)
      .reduce((count, value) => count + value.aggregated_trips_journeys.length, 0);
    const end_deleted: number = openDataContext.excludedTerritories
      .filter((e) => e.end_territory_id)
      .reduce((count, value) => count + value.aggregated_trips_journeys.length, 0);
    const total: string = await this.getTotal(openDataContext.queryParam);
    const deleted = parseInt(total) - parseInt(total_truncated);
    const intersection = deleted - start_deleted - end_deleted;
    return (
      description +
      this.build(
        total,
        total_truncated,
        deleted,
        start_deleted,
        end_deleted,
        Math.abs(intersection),
        new Date(openDataContext.queryParam.date.start),
      )
    );
  }

  private async getTotal(queryParam: OpenDataTripSearchInterface): Promise<string> {
    const queryParamCopy: OpenDataTripSearchInterface = {
      ...queryParam,
    };
    delete queryParamCopy.excluded_end_territory_id;
    delete queryParamCopy.excluded_start_territory_id;
    return (await this.tripRepository.searchCount(queryParamCopy)).count;
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
    return `\n\n# Spécificités jeu de données ${start_date.toLocaleString('fr-FR', {
      month: 'long',
    })} ${start_date.getFullYear()}
Les données concernent également les trajets dont le point de départ OU d'arrivée est situé en dehors du territoire français.

* Nombre trajets collectés et validés par le registre de preuve de covoiturage **${total}**
* Nombre de trajets exposés dans le jeu de données : **${total_truncated}**
* Nombre de trajets supprimés du jeu de données : **${deleted} = ${start_delete} + ${end_deleted} - ${intersection}**
    * Nombre de trajets dont l’occurrence du code INSEE de départ est < 6 : **${start_delete}**
    * Nombre de trajets dont l’occurrence du code INSEE d'arrivée est < 6 : **${end_deleted}**
    * Nombre de trajets dont l’occurrence du code INSEE de départ ET d'arrivée est < 6 : **${intersection}**`;
  }
}
