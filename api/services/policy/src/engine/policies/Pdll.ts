import {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
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
import { MaximumTargetEnum } from '../helpers/max';
import { startsAndEndsAt } from '../helpers/position';

export const Pdll: PolicyHandlerStaticInterface = class implements PolicyHandlerInterface {
  static readonly id = '249';
  protected operators = [
    '80279897500024', // Karos
    '75315323800047', // Klaxit
    '49190454600034', // BBC
    '84403286200014', // Mobicoop
  ];
  protected slices = [
    { start: 2000, end: 20000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, 200) },
    { start: 20000, end: 50000, fn: (ctx: StatelessContextInterface) => perSeat(ctx, perKm(ctx, { amount: 10 })) },
  ];
  protected limits = [
    setMax('5499304F-2C64-AB1A-7392-52FF88F5E78D', 200000000, watchForGlobalMaxAmount),
    setMax('8C5251E8-AB82-EB29-C87A-2BF59D4F6328', 6, watchForPersonMaxTripByDay, MaximumTargetEnum.Driver),
  ];

  protected processExclusion(ctx: StatelessContextInterface) {
    isOperatorOrThrow(ctx, this.operators);
    onDistanceRangeOrThrow(ctx, { min: 2000 });
    isOperatorClassOrThrow(ctx, ['B', 'C']);

    // Exclure les trajets NM->NM, Angers->Angers, Le Mans->Le Mans
    if (
      startsAndEndsAt(ctx, { aom: ['244900015'] }) ||
      startsAndEndsAt(ctx, { aom: ['244400404'] }) ||
      startsAndEndsAt(ctx, { aom: ['247200132'] }) ||
      startsAndEndsAt(ctx, { aom: ['200071678'] })
    ) {
      throw new NotEligibleTargetException();
    }

    // Exclure les trajets qui ne sont pas dans l'aom
    if (!startsAt(ctx, { reg: ['52'] }) || !endsAt(ctx, { reg: ['52'] })) {
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
    <p _ngcontent-fyn-c231="" id="summary" class="campaignSummaryText-content-text">
    <p>Campagne d’incitation au covoiturage du <b> mardi 05 janvier 2021 au dimanche 01 janvier 2023</b>, limitée à lundi,
      mardi, mercredi, jeudi, vendredi, samedi, dimanche
    </p>
    <p>Cette campagne est limitée à
      <b>2000000 euros </b>.
    </p>
    <p>Les <b> conducteurs </b> effectuant un trajet d'au moins 2 km sont incités selon les règles suivantes : </p>
    <ul>
      <li><b>De 2 à 20 km : 2 euros par trajet par passager.</b></li>
      <li><b>De 20 à 50 km : 0.1 euro par trajet par km par passager.</b></li>
    </ul>
    <p>Les restrictions suivantes seront appliquées :</p>
    <ul>
      <li><b>6 trajets maximum pour le conducteur par jour.</b></li>
    </ul>
    <p>La campagne est limitée aux opérateurs BlaBlaCar Daily, Karos, Klaxit, Mobicoop proposant des preuves de classe <b>B
        ou C</b>.</p>
    <p>Les axes suivants ne sont pas incités : </p>
    <ul>
      <li>De <b>Nantes (44)</b>, <b>Basse-Goulaine (44)</b>, <b>Bouaye (44)</b>, <b>Bouguenais (44)</b>, <b>Brains (44)</b>,
        <b>Carquefou (44)</b>, <b>La Chapelle-sur-Erdre (44)</b>, <b>Couëron (44)</b>, <b>Indre (44)</b>,
        <b>Mauves-sur-Loire (44)</b>, <b>La Montagne (44)</b>, <b>Orvault (44)</b>, <b>Le Pellerin (44)</b>, <b>Rezé
          (44)</b>, <b>Saint-Aignan-Grandlieu (44)</b>, <b>Saint-Herblain (44)</b>, <b>Saint-Jean-de-Boiseau (44)</b>,
        <b>Saint-Léger-les-Vignes (44)</b>, <b>Saint-Sébastien-sur-Loire (44)</b>, <b>Sautron (44)</b>, <b>Les Sorinières
          (44)</b>, <b>Thouaré-sur-Loire (44)</b> ou <b>Vertou (44)</b> à <b>Nantes (44)</b>, <b>Basse-Goulaine (44)</b>,
        <b>Bouaye (44)</b>, <b>Bouguenais (44)</b>, <b>Brains (44)</b>, <b>Carquefou (44)</b>, <b>La Chapelle-sur-Erdre
          (44)</b>, <b>Couëron (44)</b>, <b>Indre (44)</b>, <b>Mauves-sur-Loire (44)</b>, <b>La Montagne (44)</b>,
        <b>Orvault (44)</b>, <b>Le Pellerin (44)</b>, <b>Rezé (44)</b>, <b>Saint-Aignan-Grandlieu (44)</b>,
        <b>Saint-Herblain (44)</b>, <b>Saint-Jean-de-Boiseau (44)</b>, <b>Saint-Léger-les-Vignes (44)</b>,
        <b>Saint-Sébastien-sur-Loire (44)</b>, <b>Sautron (44)</b>, <b>Les Sorinières (44)</b>, <b>Thouaré-sur-Loire
          (44)</b> ou <b>Vertou (44)</b>.</li>
      <li>De <b>Angers (49)</b>, <b>Avrillé (49)</b>, <b>Beaucouzé (49)</b>, <b>Béhuard (49)</b>, <b>Bouchemaine (49)</b>,
        <b>Briollay (49)</b>, <b>Cantenay-Épinard (49)</b>, <b>Écouflant (49)</b>, <b>Écuillé (49)</b>, <b>Feneu (49)</b>,
        <b>Loire-Authion (49)</b>, <b>Longuenée-en-Anjou (49)</b>, <b>Montreuil-Juigné (49)</b>, <b>Mûrs-Erigné (49)</b>,
        <b>Le Plessis-Grammoire (49)</b>, <b>Les Ponts-de-Cé (49)</b>, <b>Rives-du-Loir-en-Anjou (49)</b>,
        <b>Saint-Barthélemy-d'Anjou (49)</b>, <b>Saint-Clément-de-la-Place (49)</b>, <b>Sainte-Gemmes-sur-Loire (49)</b>,
        <b>Saint-Lambert-la-Potherie (49)</b>, <b>Saint-Léger-de-Linières (49)</b>, <b>Saint-Martin-du-Fouilloux (49)</b>,
        <b>Sarrigné (49)</b>, <b>Savennières (49)</b>, <b>Soulaines-sur-Aubance (49)</b>, <b>Soulaire-et-Bourg (49)</b>,
        <b>Trélazé (49)</b> ou <b>Verrières-en-Anjou (49)</b> à <b>Angers (49)</b>, <b>Avrillé (49)</b>, <b>Beaucouzé
          (49)</b>, <b>Béhuard (49)</b>, <b>Bouchemaine (49)</b>, <b>Briollay (49)</b>, <b>Cantenay-Épinard (49)</b>,
        <b>Écouflant (49)</b>, <b>Écuillé (49)</b>, <b>Feneu (49)</b>, <b>Loire-Authion (49)</b>, <b>Longuenée-en-Anjou
          (49)</b>, <b>Montreuil-Juigné (49)</b>, <b>Mûrs-Erigné (49)</b>, <b>Le Plessis-Grammoire (49)</b>, <b>Les
          Ponts-de-Cé (49)</b>, <b>Rives-du-Loir-en-Anjou (49)</b>, <b>Saint-Barthélemy-d'Anjou (49)</b>,
        <b>Saint-Clément-de-la-Place (49)</b>, <b>Sainte-Gemmes-sur-Loire (49)</b>, <b>Saint-Lambert-la-Potherie (49)</b>,
        <b>Saint-Léger-de-Linières (49)</b>, <b>Saint-Martin-du-Fouilloux (49)</b>, <b>Sarrigné (49)</b>, <b>Savennières
          (49)</b>, <b>Soulaines-sur-Aubance (49)</b>, <b>Soulaire-et-Bourg (49)</b>, <b>Trélazé (49)</b> ou
        <b>Verrières-en-Anjou (49)</b>.</li>
      <li>De <b>Le Mans (72)</b>, <b>Aigné (72)</b>, <b>Allonnes (72)</b>, <b>Arnage (72)</b>, <b>Champagné (72)</b>, <b>La
          Chapelle-Saint-Aubin (72)</b>, <b>Chaufour-Notre-Dame (72)</b>, <b>Coulaines (72)</b>, <b>Fay (72)</b>, <b>La
          Milesse (72)</b>, <b>Mulsanne (72)</b>, <b>Pruillé-le-Chétif (72)</b>, <b>Rouillon (72)</b>, <b>Ruaudin (72)</b>,
        <b>Saint-Georges-du-Bois (72)</b>, <b>Saint-Saturnin (72)</b>, <b>Sargé-lès-le-Mans (72)</b>, <b>Trangé (72)</b> ou
        <b>Yvré-l'Évêque (72)</b> à <b>Le Mans (72)</b>, <b>Aigné (72)</b>, <b>Allonnes (72)</b>, <b>Arnage (72)</b>,
        <b>Champagné (72)</b>, <b>La Chapelle-Saint-Aubin (72)</b>, <b>Chaufour-Notre-Dame (72)</b>, <b>Coulaines (72)</b>,
        <b>Fay (72)</b>, <b>La Milesse (72)</b>, <b>Mulsanne (72)</b>, <b>Pruillé-le-Chétif (72)</b>, <b>Rouillon (72)</b>,
        <b>Ruaudin (72)</b>, <b>Saint-Georges-du-Bois (72)</b>, <b>Saint-Saturnin (72)</b>, <b>Sargé-lès-le-Mans (72)</b>,
        <b>Trangé (72)</b> ou <b>Yvré-l'Évêque (72)</b>.</li>
      <p></p>
    </ul>
    </p>`;
  }
}
