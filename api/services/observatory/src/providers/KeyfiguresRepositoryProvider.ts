import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  KeyfiguresRepositoryInterface,
  KeyfiguresRepositoryInterfaceResolver,
  MonthlyKeyfiguresParamsInterface,
  MonthlyKeyfiguresResultInterface,
} from '../interfaces/KeyfiguresRepositoryProviderInterface';
import { checkTerritoryParam } from '../helpers/checkParams';

@provider({
  identifier: KeyfiguresRepositoryInterfaceResolver,
})
export class KeyfiguresRepositoryProvider implements KeyfiguresRepositoryInterface {
  private readonly table = 'observatory.monthly_flux';
  private readonly perim_table = 'geo.perimeters';

  constructor(private pg: PostgresConnection) {}

  // Retourne les données de la table observatory.monthly_flux pour le mois et l'année
  // et le type de territoire en paramètres
  // Paramètres optionnels observe et code pour filtrer les résultats sur un territoire
  async getMonthlyKeyfigures(params: MonthlyKeyfiguresParamsInterface): Promise<MonthlyKeyfiguresResultInterface> {
    const sql = {
      values: [params.year, params.month, params.type, params.code],
      text: `SELECT 
        l_territory_1 as ter_1, lng_1, lat_1,
        l_territory_2 as ter_2, lng_2, lat_2,
        passengers, distance, duration 
      FROM ${this.table}
      WHERE year = $1
      AND month = $2
      AND type = $3::observatory.monthly_flux_type_enum
      AND distance <= 80
      ${
        params.code
          ? `AND (territory_1 IN (
          SELECT ${checkTerritoryParam(params.type)} FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = $1) t 
          WHERE ${checkTerritoryParam(params.observe)} = $4
        ) OR territory_2 IN (
          SELECT ${checkTerritoryParam(params.type)} FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = $1) t 
          WHERE ${checkTerritoryParam(params.observe)} = $4
        ))`
          : ''
      } 
      AND territory_1 <> territory_2;`,
    };
    const response: { rowCount: number; rows: MonthlyKeyfiguresResultInterface } = await this.pg.getClient().query(sql);
    return response.rows;
  }
}
