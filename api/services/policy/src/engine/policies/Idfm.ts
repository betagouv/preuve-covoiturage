import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import {
  OperatorsEnum,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  StatefulContextInterface,
  StatelessContextInterface,
} from '../../interfaces';
import {
  atDate,
  isAfter,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  endsAt,
  startsAt,
  setMax,
  watchForGlobalMaxAmount,
  watchForPersonMaxAmountByMonth,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { MaximumTargetEnum } from '../helpers/max';

export const Idfm: PolicyHandlerStaticInterface = class implements PolicyHandlerInterface {
  static readonly id = '460';
  protected operators = [OperatorsEnum.BlaBlaDaily, OperatorsEnum.Karos, OperatorsEnum.Klaxit];
  protected slices = [
    { start: 2000, end: 15000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 150) },
    { start: 15000, end: 30000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10 })) },
  ];
  protected limits = [
    setMax('99911EAF-89AB-C346-DDD5-BD2C7704F935', 600000000, watchForGlobalMaxAmount),
    setMax('ECDE3CD4-96FF-C9D2-BA88-45754205A798', 15000, watchForPersonMaxAmountByMonth, MaximumTargetEnum.Driver),
    setMax('56042464-852C-95B8-2009-8DD4808C9370', 6, watchForPersonMaxTripByDay, MaximumTargetEnum.Driver),
  ];
  protected pollutionAndStrikeDates = [
    '2022-02-18',
    '2022-03-25',
    '2022-03-26',
    '2022-03-27',
    '2022-03-28',
    '2022-06-18',
    '2022-07-06',
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 2000, max: 150000 });

    // Exclure les trajet Paris-Paris
    if (startsAt(ctx, { com: ['75056'] }) && endsAt(ctx, { com: ['75056'] })) {
      throw new NotEligibleTargetException();
    }

    // Exclure les trajets qui ne sont pas dans l'aom
    if (!startsAt(ctx, { aom: ['217500016'] }) || !endsAt(ctx, { aom: ['217500016'] })) {
      throw new NotEligibleTargetException();
    }

    // Classe de trajet
    isOperatorClassOrThrow(ctx, ['B', 'C']);
    // Modification de la campagne au 1er septembre
    if (isAfter(ctx, { date: new Date('2022-09-01') })) {
      isOperatorClassOrThrow(ctx, ['C']);
    }
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

    // Jour de pollution
    if (atDate(ctx, { dates: this.pollutionAndStrikeDates })) {
      amount *= 1.5;
    }

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
        glob: 600000000,
      },
    };
  }

  describe(): string {
    return `
   
<p id="summary" class="campaignSummaryText-content-text">
<p>Campagne d’incitation au covoiturage du <b> jeudi 20 mai 2021 au samedi 31 décembre 2022</b>, limitée à lundi, mardi,
  mercredi, jeudi, vendredi, samedi, dimanche
</p>
<p>Cette campagne est limitée à
  <b>6000000 euros </b>.
</p>
<p>Les <b> conducteurs </b> effectuant un trajet d'au moins 2 km sont incités selon les règles suivantes : </p>
<ul>
  <li><b>De 2 à 15 km : 1.5 euros par trajet par passager.</b></li>
  <li><b>De 15 à 30 km : 0.1 euro par trajet par km par passager.</b></li>
</ul>
<p>Les restrictions suivantes seront appliquées :</p>
<ul>
  <li><b>6 trajets maximum pour le conducteur par jour.</b></li>
  <li><b>150 euros maximum pour le conducteur par mois.</b></li>
</ul>
<p>La campagne est limitée aux opérateurs BlaBlaCar Daily, Karos, Klaxit proposant des preuves de classe <b>B ou C</b>.
</p>
<p>Les axes suivants ne sont pas incités : </p>
<ul>
  <li>De <b>Paris (75)</b> à <b>Paris (75)</b>.</li>
  <p></p>
</ul>
</p>
  `;
  }
};
