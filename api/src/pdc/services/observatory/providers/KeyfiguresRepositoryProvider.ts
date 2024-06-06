import { provider } from '/ilos/common/index.ts';
import { PostgresConnection } from '/ilos/connection-postgres/index.ts';
import {
  KeyfiguresRepositoryInterface,
  KeyfiguresRepositoryInterfaceResolver,
  MonthlyKeyfiguresParamsInterface,
  MonthlyKeyfiguresResultInterface,
} from '../interfaces/KeyfiguresRepositoryProviderInterface.ts';

@provider({
  identifier: KeyfiguresRepositoryInterfaceResolver,
})
export class KeyfiguresRepositoryProvider implements KeyfiguresRepositoryInterface {
  private readonly flux_table = 'observatory.monthly_flux';
  private readonly occupation_table = 'observatory.monthly_occupation';

  constructor(private pg: PostgresConnection) {}

  // Retourne les données de la table observatory.monthly_flux pour le mois et l'année
  // et le type de territoire en paramètres
  // Paramètres optionnels observe et code pour filtrer les résultats sur un territoire
  async getMonthlyKeyfigures(params: MonthlyKeyfiguresParamsInterface): Promise<MonthlyKeyfiguresResultInterface> {
    const sql = {
      values: [params.year, params.month, params.type, params.code],
      text: `SELECT b.territory,b.l_territory,
      sum(a.passengers)::int AS passengers,
      sum(a.distance) AS distance,
      sum(a.duration) AS duration,
      b.journeys,
      (SELECT journeys 
        FROM ${this.flux_table}
        WHERE territory_1 = territory_2
        AND year = $1
        AND month = $2
        AND type::varchar = $3::varchar
        AND territory_1 = $4
      ) as intra_journeys,
      b.trips,
      b.has_incentive,
      b.occupation_rate 
      FROM ${this.flux_table} a
      LEFT JOIN ${this.occupation_table} b ON (a.territory_1 = b.territory OR a.territory_2 = b.territory) 
      AND a.type::varchar = b.type::varchar AND a.year = b.year AND a.month = b.month 
      WHERE b.territory = $4 AND a.type::varchar = $3::varchar AND a.year = $1 AND a.month = $2
      GROUP BY b.territory,b.l_territory,b.journeys,b.trips,b.has_incentive,b.occupation_rate;`,
    };
    const response: { rowCount: number; rows: MonthlyKeyfiguresResultInterface } = await this.pg
      .getClient()
      .query<any>(sql);
    return response.rows;
  }
}
