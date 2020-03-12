import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { PostRule } from '../PostRule';
import { RuleHandlerParamsInterface } from '../../interfaces';

interface IdfmParametersInterface {
  territory_id: number;
  paris_insee_code: string[];
}

export class IdfmRegular extends PostRule<IdfmParametersInterface> {
  static readonly slug: string = 'idfm_regular';
  static readonly description: string = 'Politique régulière IDFM';
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
      throw new NotApplicableTargetException(IdfmRegular.slug);
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
      throw new NotApplicableTargetException(`Campaign "${IdfmRegular.slug}" not Application on target`);
    }

    let result = 0;
    // 2km to 15km
    {
      // const journeys = eligibleJourneys.filter(p => p.distance < 15000);
      const distance = eligibleJourneys.reduce((acc, j) => acc + Math.min(15000, j.distance) * j.seats, 0);
      result += Math.max(150, (10 * distance) / 1000);
    }

    // 15km to 30km
    {
      const journeys = eligibleJourneys.filter((p) => p.distance > 15000);
      const distance = journeys.reduce((acc, j) => acc + (Math.min(30000, j.distance) - 15000) * j.seats, 0);
      result += (10 * distance) / 1000;
    }

    ctx.result = result;
  }
}
