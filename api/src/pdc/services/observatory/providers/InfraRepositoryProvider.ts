import { provider } from '@ilos/common/index.ts';
import { PostgresConnection } from '@ilos/connection-postgres/index.ts';
import {
  InfraRepositoryInterface,
  InfraRepositoryInterfaceResolver,
  AiresCovoiturageResultInterface,
  AiresCovoiturageParamsInterface,
} from '../interfaces/InfraRepositoryProviderInterface.ts';
import { checkTerritoryParam } from '../helpers/checkParams.ts';

@provider({
  identifier: InfraRepositoryInterfaceResolver,
})
export class InfraRepositoryProvider implements InfraRepositoryInterface {
  private readonly table = 'observatory.aires_covoiturage';
  private readonly perim_table = 'geo.perimeters';
  constructor(private pg: PostgresConnection) {}

  async getAiresCovoiturage(params: AiresCovoiturageParamsInterface): Promise<AiresCovoiturageResultInterface> {
    const sql = {
      values: [params.code],
      text: `SELECT 
      id_lieu, 
      nom_lieu, 
      com_lieu, 
      type, 
      date_maj, 
      nbre_pl, 
      nbre_pmr, 
      duree, 
      horaires, 
      proprio, 
      lumiere, 
      ST_AsGeoJSON(geom,6)::json as geom 
      FROM ${this.table}
      WHERE ouvert = true
      ${
        checkTerritoryParam(params.type) && params.code
          ? `AND insee IN (
          SELECT arr 
          FROM ${this.perim_table}
          WHERE year = geo.get_latest_millesime() 
          AND ${checkTerritoryParam(params.type)} = $1
        )`
          : ''
      };`,
    };
    const response: { rowCount: number; rows: AiresCovoiturageResultInterface } = await this.pg.getClient().query(sql);
    return response.rows;
  }
}
