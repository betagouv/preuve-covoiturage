import { provider } from '@ilos/common';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { OpenDataTripSearchInterface } from '../../shared/trip/common/interfaces/TripSearchInterface';

@provider()
export class HappenMarkdownDescription {
  constructor(private tripRepository: TripRepositoryProvider) {}

  async call(queryParam: OpenDataTripSearchInterface, description = ''): Promise<string> {
    const total_truncated: string = await (await this.tripRepository.searchCount(queryParam)).count;
    const intersection: number = queryParam.excluded_start_territory_id.filter((t) =>
      queryParam.excluded_end_territory_id.includes(t),
    ).length;
    const start_deleted = queryParam.excluded_start_territory_id.length;
    console.debug(start_deleted);
    const end_deleted = queryParam.excluded_end_territory_id.length;
    const queryParamCopy: OpenDataTripSearchInterface = {
      ...queryParam,
    };
    delete queryParamCopy.excluded_end_territory_id;
    delete queryParamCopy.excluded_start_territory_id;
    const total: string = await (await this.tripRepository.searchCount(queryParamCopy)).count;
    return (
      description +
      this.buildDescription(
        total,
        total_truncated,
        parseInt(total) - parseInt(total_truncated),
        start_deleted,
        end_deleted,
        intersection,
      )
    );
  }

  private buildDescription(
    total: string,
    trunc_total: string,
    deleted: number,
    start_delete: number,
    end_deleted: number,
    intersection: number,
  ): string {
    return `\n\n# Spécificités jeu de données septembre 2021
Les données concernent également les trajets dont le point de départ OU d'arrivée est situé en dehors du territoire français.

* Nombre trajets collectés et validés par le registre de preuve de covoiturage **${total}**
* Nombre de trajets exposés dans le jeu de données : **${trunc_total}**
* Nombre de trajets supprimés du jeu de données : **${deleted} = ${start_delete} + ${end_deleted} - ${intersection}**
    * Nombre d’occurrences du code INSEE de départ est < 6 : **${start_delete}**
    * Nombre d’occurrences du code INSEE d'arrivée est < 6 : **${end_deleted}**
    * Nombre d’occurrences du code INSEE de départ ET d'arrivée est < 6 : **${intersection}**`;
  }
}
