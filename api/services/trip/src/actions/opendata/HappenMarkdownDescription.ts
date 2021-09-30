/* eslint-disable max-len */
import { provider } from '@ilos/common';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { OpenDataTripSearchInterface } from '../../shared/trip/common/interfaces/TripSearchInterface';

@provider()
export class HappenMarkdownDescription {
  constructor(private tripRepository: TripRepositoryProvider) {}

  async call(queryParam: OpenDataTripSearchInterface, description = ''): Promise<string> {
    const total_truncated: string = await (await this.tripRepository.searchCount(queryParam)).count;
    const start_deleted = queryParam.excluded_start_territory_id.length;
    const end_deleted = queryParam.excluded_end_territory_id.length;
    const total: string = await this.getTotal(queryParam);
    const deleted = parseInt(total) - parseInt(total_truncated);
    const intersection = start_deleted + end_deleted - deleted;
    return (
      description +
      this.build(total, total_truncated, deleted, start_deleted, end_deleted, intersection, queryParam.date.start)
    );
  }

  private async getTotal(queryParam: OpenDataTripSearchInterface) {
    const queryParamCopy: OpenDataTripSearchInterface = {
      ...queryParam,
    };
    delete queryParamCopy.excluded_end_territory_id;
    delete queryParamCopy.excluded_start_territory_id;
    const total: string = await (await this.tripRepository.searchCount(queryParamCopy)).count;
    return total;
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
    return `\n\n# Spécificités jeu de données ${start_date.toLocaleString('fr-FR', { month: 'long' })} 2021
Les données concernent également les trajets dont le point de départ OU d'arrivée est situé en dehors du territoire français.

* Nombre trajets collectés et validés par le registre de preuve de covoiturage **${total}**
* Nombre de trajets exposés dans le jeu de données : **${total_truncated}**
* Nombre de trajets supprimés du jeu de données : **${deleted} = ${start_delete} + ${end_deleted} - ${intersection}**
    * Nombre d’occurrences du code INSEE de départ est < 6 : **${start_delete}**
    * Nombre d’occurrences du code INSEE d'arrivée est < 6 : **${end_deleted}**
    * Nombre d’occurrences du code INSEE de départ ET d'arrivée est < 6 : **${intersection}**`;
  }
}
