import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { AbstractRule } from '../AbstractRule';
import { RuleHandlerParamsInterface } from '../../interfaces';

interface IdfmParametersInterface {
  territory_id: number;
  paris_insee_code: string[];
}

export class IdfmStrikeJan2020 extends AbstractRule<IdfmParametersInterface> {
  static readonly slug: string = 'idfm_strike_jan2020';
  static readonly description: string = 'Politique de grève IDFM janvier 2020';
  static readonly schema: { [k: string]: any } = {
    type: 'object',
    required: ['territory_id', 'paris_insee_code'],
    properties: {
      territory_id: {
        type: 'number',
      },
      paris_insee_code: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  };
  async apply(ctx: RuleHandlerParamsInterface): Promise<void> {
    if (!ctx.person.is_driver) {
      throw new NotApplicableTargetException(IdfmStrikeJan2020.slug);
    }

    const eligibleJourneys = ctx.trip.people
      // Uncomment this for debug
      // .map((p) => {
      //   console.log({
      //     is_not_driver: !p.is_driver,
      //     is_over_18: p.is_over_18 !== false,
      //     start_idf: p.start_territory_id === this.parameters.territory_id,
      //     end_idf: p.end_territory_id === this.parameters.territory_id,
      //     not_pp: !(
      //       this.parameters.paris_insee_code.indexOf(p.start_insee) >= 0 &&
      //       this.parameters.paris_insee_code.indexOf(p.end_insee) >= 0
      //     ),
      //     above_2km: p.distance >= 2000,
      //   });
      //   return p;
      // })
      .filter(
        (p) =>
          !p.is_driver &&
          p.is_over_18 !== false && // accept TRUE and NULL @issue #848
          p.start_territory_id === this.parameters.territory_id && // au départ
          p.end_territory_id === this.parameters.territory_id && // et à l'arrivée de l'ile de france
          p.distance >= 2000 && // trajet supérieur à 2km seulement
          !(
            this.parameters.paris_insee_code.indexOf(p.start_insee) >= 0 &&
            this.parameters.paris_insee_code.indexOf(p.end_insee) >= 0
          ),
        // mais pas Paris-Paris
      )
      .map((p) => ({ distance: p.distance, seats: p.seats }))
      .sort((p1, p2) => (p1.distance > p2.distance ? 1 : p1.distance < p2.distance ? -1 : 0));

    if (eligibleJourneys.length === 0) {
      throw new NotApplicableTargetException(`Campaign "${IdfmStrikeJan2020.slug}" not Application on target`);
    }

    // give 4€ for any distance
    ctx.result = 400;
  }
}
