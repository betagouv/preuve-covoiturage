import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  StatefulContextInterface,
  StatelessContextInterface,
} from '../../interfaces';
import { NotEligibleTargetException } from '../exceptions/NotEligibleTargetException';
import {
  endsAt,
  isOperatorClassOrThrow,
  isOperatorOrThrow,
  onDistanceRange,
  onDistanceRangeOrThrow,
  perKm,
  perSeat,
  setMax,
  startsAt,
  watchForGlobalMaxAmount,
  watchForPersonMaxTripByDay,
} from '../helpers';
import { applyForMaximum, watchForMaxPassengerByTrip } from '../helpers/max';
import { startsAndEndsAt } from '../helpers/position';

export class Nm implements PolicyHandlerInterface {
  static readonly id = '249';
  protected operators = [
    '75315323800047', // Klaxit
  ];
  protected slices = [
    { start: 2000, end: 20000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    { start: 20000, end: 150000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10 })) },
  ];
  protected limits = [
    setMax('69FD0093-CEEE-0709-BB80-878D2E857630', 1000000000, watchForGlobalMaxAmount),
    setMax('286AAF87-5CDB-A7C0-A599-FBE7FB6C5442', 4, watchForPersonMaxTripByDay, true),
    setMax('6456EC1D-2183-71DC-B08E-0B8FC30E4A4E', 4, watchForPersonMaxTripByDay, false),
    /*
      {
    "slug": "max_trip_restriction",
    "parameters": {
      "amount": 10000000,
      "period": "campaign",
      "uuid": "D1FED21B-5160-A1BF-C052-5DA7A190996C"
    }
  },
  */
    /*
     {
    "slug": "max_passenger_restriction",
    "parameters": {
      "target": "driver",
      "amount": 3,
      "uuid": "D5FA9FA9-E8CC-478E-80ED-96FDC5476689"
    }
  }
    **/
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 2000 });
    isOperatorClassOrThrow(ctx, ['C']);

    // Exclure les trajets qui ne sont pas dans l'aom NM
    if (!startsAt(ctx, { aom: ['244400404'] }) || !endsAt(ctx, { aom: ['244400404'] })) {
      throw new NotEligibleTargetException();
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
        glob: 200000000,
      },
    };
  }

  describe(): string {
    return `
    <p _ngcontent-pmm-c231="" id="summary" class="campaignSummaryText-content-text">
<p>Campagne d’incitation au covoiturage du <b> jeudi 02 décembre 2021 au mardi 07 février 2023</b>, limitée à lundi,
  mardi, mercredi, jeudi, vendredi, samedi, dimanche
</p>
<p>Cette campagne est limitée à
  <b>10000000 euros et 10000000 trajets </b>.
</p>
<p>Les <b> conducteurs </b> effectuant un trajet d'au moins 2 km sont incités selon les règles suivantes : </p>
<ul>
  <li><b>De 2 à 20 km : 2 euros par trajet.</b></li>
  <li><b>À partir de 20 km : 0.1 euro par trajet par km.</b></li>
</ul>
<p>Les restrictions suivantes seront appliquées :</p>
<ul>
  <li><b>4 trajets maximum pour le conducteur par jour.</b></li>
  <li><b>4 trajets maximum pour le passager par jour.</b></li>
</ul>
<p>La campagne est limitée à l'opérateur Klaxit proposant des preuves de classe <b>C</b>.</p>
<p>Les trajets incités doivent être sur les axes suivants : </p>
<ul>
  <li>De <b>Basse-Goulaine (44)</b>, <b>Bouaye (44)</b>, <b>Bouguenais (44)</b>, <b>Brains (44)</b>, <b>Carquefou
      (44)</b>, <b>Couëron (44)</b>, <b>Indre (44)</b>, <b>La Chapelle-sur-Erdre (44)</b>, <b>La Montagne (44)</b>,
    <b>Le Pellerin (44)</b>, <b>Les Sorinières (44)</b>, <b>Mauves-sur-Loire (44)</b>, <b>Nantes (44)</b>, <b>Orvault
      (44)</b>, <b>Rezé (44)</b>, <b>Saint-Aignan-Grandlieu (44)</b>, <b>Saint-Herblain (44)</b>,
    <b>Saint-Jean-de-Boiseau (44)</b>, <b>Saint-Léger-les-Vignes (44)</b>, <b>Saint-Sébastien-sur-Loire (44)</b>,
    <b>Sautron (44)</b>, <b>Thouaré-sur-Loire (44)</b> ou <b>Vertou (44)</b> à <b>Basse-Goulaine (44)</b>, <b>Bouaye
      (44)</b>, <b>Bouguenais (44)</b>, <b>Brains (44)</b>, <b>Carquefou (44)</b>, <b>Couëron (44)</b>, <b>Indre
      (44)</b>, <b>La Chapelle-sur-Erdre (44)</b>, <b>La Montagne (44)</b>, <b>Le Pellerin (44)</b>, <b>Les Sorinières
      (44)</b>, <b>Mauves-sur-Loire (44)</b>, <b>Nantes (44)</b>, <b>Orvault (44)</b>, <b>Rezé (44)</b>,
    <b>Saint-Aignan-Grandlieu (44)</b>, <b>Saint-Herblain (44)</b>, <b>Saint-Jean-de-Boiseau (44)</b>,
    <b>Saint-Léger-les-Vignes (44)</b>, <b>Saint-Sébastien-sur-Loire (44)</b>, <b>Sautron (44)</b>, <b>Thouaré-sur-Loire
      (44)</b> ou <b>Vertou (44)</b>.</li>
  <p></p>
</ul>
</p>`;
  }
}
