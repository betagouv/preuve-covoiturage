import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  StatefulContextInterface,
  StatelessContextInterface,
} from '../../interfaces';
import {
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

export class Laval implements PolicyHandlerInterface {
  static readonly id = '713';
  protected operators = [
    '75315323800047', // Klaxit
  ];
  protected slices = [
    { start: 2000, end: 150000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 50 })) },
  ];
  protected limits = [
    setMax('A2CEF9FE-D179-319F-1996-9D69E0157522', 900000, watchForGlobalMaxAmount),
    setMax('70CE7566-6FD5-F850-C039-D76AF6F8CEB5', 6, watchForPersonMaxTripByDay, true),
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
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

    // TODO flécher l'incentive vers le passager
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
        glob: 900000,
      },
    };
  }

  describe(): string {
    return `<p _ngcontent-pmm-c231="" id="summary" class="campaignSummaryText-content-text">
    <p>Campagne d’incitation au covoiturage du <b> mardi 12 avril 2022 au samedi 31 décembre 2022</b>, limitée à lundi,
      mardi, mercredi, jeudi, vendredi, samedi, dimanche
    </p>
    <p>Cette campagne est limitée à
      <b>9000 euros </b>.
    </p>
    <p>Les <b> passagers </b> effectuant un trajet d'au moins 2 km sont incités selon les règles suivantes : </p>
    <ul>
      <li><b>À partir de 2 km : 0.5 euro par trajet pour le(s) passager(s).</b></li>
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
