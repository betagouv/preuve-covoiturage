import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  StatefulContextInterface,
  StatelessContextInterface,
} from '../../interfaces';
import {
  isDriverOrThrow,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  setMax,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
} from '../helpers';

export class Smt implements PolicyHandlerInterface {
  static readonly id = '766';
  protected operators = [
    '75315323800047', // Klaxit
  ];
  protected slices = [
    { start: 2000, end: 20000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    { start: 20000, end: 40000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10 })) },
  ];
  protected limits = [
    setMax('489A7D57-1948-61DA-E5FA-1AE3217325BA', 80000000, watchForGlobalMaxAmount),
    setMax('E7B969E7-D701-2B9F-80D2-B30A7C3A5220', 6, watchForPersonMaxTripByDay, true),
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isDriverOrThrow(ctx);
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 2000, max: 150000 });
    isOperatorClassOrThrow(ctx, ['B', 'C']);
  }

  processStateless(ctx: StatelessContextInterface): void {
    this.processExclusion(ctx);

    // Mise en place des limites
    for (const limit of this.limits) {
      const [staless] = limit;
      staless(ctx);
    }

    // Par kilomètre
    let amount = 0;
    for (const { start, end, fn } of this.slices) {
      if (onDistanceRange(ctx, { min: start, max: end })) {
        amount = fn(ctx);
      }
    }

    // TODO gratuit pour les passager de 2 à 150km

    ctx.incentive.set(amount);
  }

  processStateful(ctx: StatefulContextInterface): void {
    for (const limit of this.limits) {
      const [, stateful] = limit;
      stateful(ctx);
    }
  }

  params(): PolicyHandlerParamsInterface {
    return {
      slices: this.slices,
      operators: this.operators,
      limits: {
        glob: 80000000,
      },
    };
  }

  describe(): string {
    return `<p _ngcontent-moy-c231="" id="summary" class="campaignSummaryText-content-text">
    <p>Campagne d’incitation au covoiturage du <b> mercredi 20 avril 2022 au samedi 31 décembre 2022</b>, limitée à lundi,
      mardi, mercredi, jeudi, vendredi, samedi, dimanche
    </p>
    <p>Cette campagne est limitée à
      <b>800000 euros </b>.
    </p>
    <p>Les <b> conducteurs et passagers </b> effectuant un trajet d'au moins 2 km sont incités selon les règles suivantes :
    </p>
    <ul>
      <li><b>De 2 à 20 km : 2 euros par trajet gratuit pour le(s) passager(s).</b></li>
      <li><b>De 20 à 40 km : 0.1 euro par trajet par km gratuit pour le(s) passager(s).</b></li>
      <li><b>À partir de 40 km : gratuit pour le(s) passager(s).</b></li>
    </ul>
    <p>Les restrictions suivantes seront appliquées :</p>
    <ul>
      <li><b>6 trajets maximum pour le conducteur par jour.</b></li>
    </ul>
    <p>La campagne est limitée à l'opérateur Klaxit proposant des preuves de classe <b>B ou C</b>.</p>
    <p></p>
    </p>`;
  }
}
