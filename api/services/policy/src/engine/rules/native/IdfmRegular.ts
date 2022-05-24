import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
import { AbstractRule } from '../AbstractRule';
import { RuleHandlerParamsInterface } from '../../interfaces';

interface IdfmParametersInterface {
  territory_id: number;
  paris_insee_code: string[];
}

export class IdfmRegular extends AbstractRule<IdfmParametersInterface> {
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
  apply(ctx: RuleHandlerParamsInterface): void {
    // disable rule
    throw new NotApplicableTargetException(IdfmRegular.slug);
    // if (
    //   !ctx.person.is_driver ||
    //   [
    //     3, // Klaxit
    //     4, // Karos
    //     9, // Blablalines
    //   ].indexOf(ctx.person.operator_id) < 0
    // ) {
    //   throw new NotApplicableTargetException(IdfmRegular.slug);
    // }

    // const eligibleJourneys = ctx.trip
    //   .filter(
    //     (p) =>
    //       !p.is_driver &&
    //       p.is_over_18 !== false && // accept TRUE and NULL @issue #848
    //       p.start_territory_id.indexOf(this.parameters.territory_id) >= 0 && // au départ
    //       p.end_territory_id.indexOf(this.parameters.territory_id) >= 0 && // et à l'arrivée de l'ile de france
    //       p.distance >= 2000, // trajet supérieur à 2km seulement
    //   )
    //   .map((p) => ({ distance: p.distance, seats: p.seats }))
    //   .sort((p1, p2) => (p1.distance > p2.distance ? 1 : p1.distance < p2.distance ? -1 : 0));

    // if (eligibleJourneys.length === 0) {
    //   throw new NotApplicableTargetException(`Campaign "${IdfmRegular.slug}" not Application on target`);
    // }

    // let result = 0;
    // // 2km to 15km
    // {
    //   // const journeys = eligibleJourneys.filter(p => p.distance < 15000);
    //   const distance = eligibleJourneys.reduce((acc, j) => acc + Math.min(15000, j.distance) * j.seats, 0);
    //   result += Math.max(150, (10 * distance) / 1000);
    // }

    // // 15km to 30km
    // {
    //   const journeys = eligibleJourneys.filter((p) => p.distance > 15000);
    //   const distance = journeys.reduce((acc, j) => acc + (Math.min(30000, j.distance) - 15000) * j.seats, 0);
    //   result += (10 * distance) / 1000;
    // }

    // ctx.result = result;
  }
}
