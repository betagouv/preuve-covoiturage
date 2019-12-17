import { ApplicableRuleInterface } from '../../interfaces/RuleInterface';
import { LOW } from '../helpers/priority';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';

interface IdfmParamsInterface {
  territory_id: number;
  paris_insee_code: string[];
}
export const idfm: ApplicableRuleInterface = {
  slug: 'idfm_regular',
  description: 'Politique régulière IDFM',
  schema: {
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
  },
  index: LOW,
  apply(params: IdfmParamsInterface) {
    return async (ctx, next) => {
      if (!ctx.person.is_driver) {
        throw new NotApplicableTargetException(idfm);
      }

      const eligibleJourneys = ctx.trip.people
        .filter(
          (p) =>
            !p.is_driver &&
            p.is_over_18 &&
            p.start_territory_id === params.territory_id && // au départ
            p.end_territory_id === params.territory_id && // et à l'arrivée de l'ile de france
            p.distance >= 2000 && // trajet supérieur à 2km seulement
            !(params.paris_insee_code.indexOf(p.start_insee) >= 0 && params.paris_insee_code.indexOf(p.end_insee) >= 0), // mais pas Paris-Paris
        )
        .map((p) => ({ distance: p.distance, seats: p.seats }))
        .sort((p1, p2) => (p1.distance > p2.distance ? 1 : p1.distance < p2.distance ? -1 : 0));

      if (eligibleJourneys.length === 0) {
        throw new NotApplicableTargetException(idfm);
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
      return next();
    };
  },
};
