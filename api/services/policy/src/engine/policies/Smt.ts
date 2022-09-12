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
  static readonly id = '713';
  protected operators = [
    '75315323800047', // Klaxit
  ];
  protected slices = [
    { start: 2000, end: 20000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    { start: 20000, end: 40000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10 })) },
  ];
  protected limits = [
    setMax('B15AD9E9-BF92-70FA-E8F1-B526D1BB6D4F', 4000000, watchForGlobalMaxAmount),
    setMax('A34719E4-DCA0-78E6-38E4-701631B106C2', 6, watchForPersonMaxTripByDay, true),
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

    ctx.incentive.set(amount);
  }

  processStateful(ctx: StatefulContextInterface): void {
    for (const limit of this.limits) {
      const [, stateful] = limit;
      stateful(ctx);
    }

    // TODO gratuit pour les passager de 2 à 150km
  }

  params(): PolicyHandlerParamsInterface {
    return {
      slices: this.slices,
      operators: this.operators,
      limits: {
        glob: 4000000,
      },
    };
  }

  describe(): string {
    return `<p _ngcontent-pmm-c231="" id="summary" class="campaignSummaryText-content-text">
    <p>Campagne d’incitation au covoiturage du <b> jeudi 14 avril 2022 au mercredi 15 février 2023</b>, limitée à lundi,
      mardi, mercredi, jeudi, vendredi, samedi, dimanche
    </p>
    <p>Cette campagne est limitée à
      <b>40000 euros </b>.
    </p>
    <p>Les <b> conducteurs et passagers </b> effectuant un trajet d'au moins 2 km sont incités selon les règles suivantes :
    </p>
    <ul>
      <li><b>De 2 à 20 km : 2 euros par trajet par passager gratuit pour le(s) passager(s).</b></li>
      <li><b>De 20 à 40 km : 0.1 euro par trajet par km par passager gratuit pour le(s) passager(s).</b></li>
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
