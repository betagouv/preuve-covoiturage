/// <reference types="Cypress" />
import { campaignFirstStepCustom } from './steps/campaign-create-first-step';
import {
  campaignSecondeStepAddInseeFilter,
  campaignSecondStepClickNextStep,
  campaignSecondStepSelectDays,
  campaignSecondStepSelectOperators,
  campaignSecondStepSelectRange,
  campaignSecondStepSelectRanks,
  campaignSecondStepSelectTargets,
  campaignSecondStepSelectTimeRange,
  checkAllOperatorSelected,
} from './steps/campaign-create-second-step';
import {
  campaignThirdStepCheckDisabledNextStep,
  campaignThirdStepClickNextStep,
  campaignThirdStepClickPreviousStep,
  campaignThirdStepSetDates,
  campaignThirdStepSetMaxRetribution,
  campaignThirdStepSetMaxTrips,
  campaignThirdStepSetRestriction,
  campaignThirdStepSetUnit,
} from './steps/campaign-create-third-step';
import { CypressExpectedCampaign } from '../../expectedApiPayload/expectedCampaign';
import { closeNotification } from '../notification.cypress';

function prepareFirstStep(): void {
  it('clicks on campaign section', () => {
    cy.get('.Header-menu .Header-menu-item:first-child').click();
  });

  it('clicks button to create new campaign', () => {
    cy.get('.CampaignDashboard-trips-header button').click();
    cy.wait(2000);
  });

  // FIRST STEP
  campaignFirstStepCustom();
}

export function cypress_campaignCreateCase1(e2e = false): void {
  prepareFirstStep();

  // check all selected +
  // it('all day selection, unselect saturday and sunday', () => {
  campaignSecondStepSelectDays(true, [5, 6]);
  // });

  const hStart: string[] = ['10', '05'];
  const hEnd: string[] = ['20', '06'];

  campaignSecondStepSelectTimeRange(`${hStart[0]}:${hStart[1]}`, `${hEnd[0]}:${hEnd[1]}`);

  // change range  [2 ... 84]
  campaignSecondStepSelectRange();

  campaignSecondeStepAddInseeFilter('blackList', false, [{ startCity: 'Lyon', endCity: 'Venissieux' }]);

  campaignSecondStepSelectRanks(true, [0, 2]);

  campaignSecondStepSelectTargets(false, true);

  checkAllOperatorSelected();

  campaignSecondStepClickNextStep();

  campaignThirdStepSetMaxRetribution('10000');

  campaignThirdStepSetUnit(1);

  campaignThirdStepSetDates('01/06/2020', '02/07/2020');

  campaignThirdStepSetMaxTrips('10');

  campaignThirdStepCheckDisabledNextStep();

  it('open panel', () => {
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(4) mat-expansion-panel-header').click();
  });

  campaignThirdStepSetRestriction(20, 1, 1, 2);
  campaignThirdStepSetRestriction(30, 2, 2, 3);
  campaignThirdStepSetRestriction(40, 1, 2, 4);
  campaignThirdStepSetRestriction(50, 2, 1, 1);

  it('sets retribution', () => {
    // open retribution extension
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(5)').click();

    // check if on driver is available in retribution
    cy.get('h4 > .ng-star-inserted').contains('Pour le conducteur');

    cy.get('h4 > .ng-star-inserted').should('not.contain', 'Pour le(s) passager(s)');

    // driver amount 0
    cy.get('.RetributionForm-inputs > .shortFormField  input').type('0');

    // ceheck for validation
    cy.get('.ParametersForm-incentiveMode .mat-error').contains(
      'Au moins une des rétributions doit avoir un montant supérieur à zéro.',
    );

    // driver amount as 20
    cy.get('.RetributionForm-inputs > .shortFormField  input').type('20');

    // check for validation : error disappeared
    cy.get('.ParametersForm-incentiveMode .mat-error').should(
      'not.contain',
      'Au moins une des rétributions doit avoir un montant supérieur à zéro.',
    );

    // par km
    // cy.get('.RetributionForm-inputs mat-checkbox:nth-child(4)').click({ force: true });
    // par passager
    // cy.get('.RetributionForm-inputs mat-checkbox:nth-child(5)').click({ force: true });

    cy.wait(200);

    // press 'par km'
    cy.get(
      // eslint-disable-next-line
      '.ParametersForm-incentiveMode-value-inputs app-retribution-form:first-child mat-checkbox:nth-child(4) .mat-checkbox-layout',
    ).click({ force: true });

    // press 'par passager'
    cy.get(
      // eslint-disable-next-line
      '.ParametersForm-incentiveMode-value-inputs app-retribution-form:first-child mat-checkbox:nth-child(5) .mat-checkbox-layout',
    ).click({ force: true });

    // eslint-disable-next-line
    // check for ' Prendre en compte l'ensemble des places réservées par le conducteur et ses passagers ' Option to be selected by default
    // eslint-disable-next-line
    cy.get('.CampaignSubForm-inputs > :nth-child(3) mat-checkbox.mat-checkbox-checked').should('be.visible');
  });

  campaignThirdStepClickNextStep();

  // Test if summary recap match with provided data
  it('final copy validation', () => {
    cy.get('#summary').contains('lundi 01 juin 2020 au jeudi 02 juillet 2020');
    cy.get('#summary').contains('lundi, mardi, mercredi, jeudi, vendredi');
    cy.get('#summary').should('not.contain', 'samedi, dimanche');
    cy.get('#summary').contains(`${hStart[0]}h${hStart[1]} à ${hEnd[0]}h${hEnd[1]}`);
    cy.get('#summary').should('contain.html', `10&nbsp;000 points`); // 10 000 points
    cy.get('#summary').contains(`2 à 84 km`);
    cy.get('#summary').contains(`20 point(s) maximum pour le conducteur par mois.`);
    cy.get('#summary').contains(`30 trajet(s) maximum pour le passager sur une année.`);
    cy.get('#summary').contains(`40 point(s) maximum pour le passager sur toute la durée de la campagne.`);
    cy.get('#summary').contains(`50 trajet(s) maximum pour le conducteur par jour.`);
    cy.get('#summary').contains(`à tous les opérateurs`);
    cy.get('#summary').contains(`des preuves de classe B`);
    cy.get('#summary').contains(`Les axes suivants ne sont pas incités`);
    cy.get('#summary').contains(`De Lyon à Vénissieux`);
  });

  // LAST STEP
  it('sets name of form', () => {
    // save screenshot to validate text
    cy.screenshot();

    cy.get('.SummaryForm mat-form-field:first-child input').type('Campagne base 1');
  });

  it('sets description of form', () => {
    cy.get('.SummaryForm mat-form-field:nth-child(2) textarea').type('Campagne base 1');
  });

  it('clicks button to save campaign', () => {
    cy.server();

    cy.get('.SummaryForm .SummaryForm-actions button:nth-of-type(1)').click();

    if (!e2e) {
      cy.wait('@campaignCreate').then((xhr) => {
        const method = xhr.request.body[0].method;

        expect(method).equal('campaign:create');
        const expectedCampaign = CypressExpectedCampaign.get();

        delete expectedCampaign.parent_id;
        delete expectedCampaign._id;
      });
    }
  });

  closeNotification();
}

export function cypress_campaignCreateCase2(e2e = false): void {
  prepareFirstStep();

  campaignSecondeStepAddInseeFilter('whiteList', true, [{ startCity: 'Vienne', endCity: 'St Etienne' }]);

  campaignSecondStepSelectRanks(false, [1]);

  campaignSecondStepSelectTargets(true, false);

  // checkAllOperatorSelected();

  campaignSecondStepSelectOperators(['klaxit', 'blabla']);

  campaignSecondStepClickNextStep();

  campaignThirdStepSetMaxRetribution('20000');

  campaignThirdStepSetUnit(0);

  campaignThirdStepSetDates('03/08/2020', '04/09/2020');

  campaignThirdStepSetMaxTrips('10');

  it('sets retribution', () => {
    // open retribution extension
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(5)').click();

    // check if on driver is available in retribution
    cy.get('h4 > .ng-star-inserted').contains('Pour le(s) passager(s)');

    cy.get('h4 > .ng-star-inserted').should('not.contain', 'Pour le conducteur');

    // select gratuit
    cy.get('.RetributionForm > h4 mat-checkbox .mat-checkbox-layout').click({ force: true });

    cy.get('.RetributionForm-inputs').should('not.visible');
  });
  campaignThirdStepClickNextStep();

  it('final copy validation', () => {
    cy.get('#summary').contains('lundi 03 août 2020 au vendredi 04 septembre 2020');
    cy.get('#summary').contains('lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche');
    cy.get('#summary').should('contain.html', `20&nbsp;000&nbsp;€`); // 10 000 points
    cy.get('#summary').contains(`gratuit pour le(s) passager(s)`);
    cy.get('#summary').contains(`des preuves de classe A ou C`);
    cy.get('#summary').contains(`incités doivent être sur les axes suivants`);
    cy.get('#summary').contains(`De Vienne à Saint-Étienne`);
  });

  // LAST STEP
  it('sets name of form', () => {
    // save screenshot to validate text
    cy.screenshot();

    cy.get('.SummaryForm mat-form-field:first-child input').type('Campagne base 2');
  });

  it('sets description of form', () => {
    cy.get('.SummaryForm mat-form-field:nth-child(2) textarea').type('Campagne base 2');
  });

  it('clicks button to save campaign', () => {
    cy.server();

    cy.get('.SummaryForm .SummaryForm-actions button:nth-of-type(1)').click();

    if (!e2e) {
      cy.wait('@campaignCreate').then((xhr) => {
        const method = xhr.request.body[0].method;

        expect(method).equal('campaign:create');
        const expectedCampaign = CypressExpectedCampaign.get();

        delete expectedCampaign.parent_id;
        delete expectedCampaign._id;
      });
    }
  });

  closeNotification();
}

export function cypress_campaignCreateCaseSplit(e2e = false): void {
  prepareFirstStep();
  campaignSecondStepSelectTargets(true, true);

  // test insee list deletetion
  campaignSecondeStepAddInseeFilter('whiteList', true, [
    { startCity: 'Vienne', endCity: 'St Etienne' },
    { startCity: 'Lyon', endCity: 'Venissieux' },
  ]);

  it('Test white list deletion', () => {
    cy.get('.inseeFilter-list:nth-child(1) .mat-icon').click({ force: true });
    cy.get('.inseeFilter-list:nth-child(1)').should('not.contain', 'Vienne');
    cy.get('.inseeFilter-list:nth-child(1) .mat-icon').click({ force: true });
  });

  campaignSecondeStepAddInseeFilter('blackList', true, [
    { startCity: 'Lyon', endCity: 'Venissieux' },
    { startCity: 'Vienne', endCity: 'St Etienne' },
  ]);

  it('Test black list deletion', () => {
    cy.get('.inseeFilter-list:nth-child(1) .mat-icon').click({ force: true });
    cy.get('.inseeFilter-list:nth-child(1)').should('not.contain', 'Lyon');
    cy.get('.inseeFilter-list:nth-child(1) .mat-icon').click({ force: true });
  });

  campaignSecondStepClickNextStep();
  campaignThirdStepSetMaxRetribution('20000');
  campaignThirdStepSetUnit(0);
  campaignThirdStepSetDates('03/08/2020', '04/09/2020');

  campaignThirdStepSetMaxTrips('1000');

  // test restriction deletion

  it('open panel', () => {
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(4) mat-expansion-panel-header').click();
  });
  campaignThirdStepSetRestriction(20, 1, 1, 2);
  campaignThirdStepSetRestriction(30, 2, 2, 3);
  campaignThirdStepSetRestriction(40, 1, 2, 4);

  it('test restriction deletion', () => {
    cy.get('.ParametersForm-restriction:nth-child(2) .mat-icon').click({ force: true });
    cy.get('.ParametersForm-restriction:nth-child(2)').should('not.contain', '30 trajet(s)');
  });

  it('sets retribution', () => {
    // open retribution extension
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(5)').click();

    // select gradual split mode
    cy.get('.ParametersForm-incentiveMode-toggle .mat-slide-toggle-label').click();

    // create 2 other splits
    cy.get('.ParametersForm-incentiveMode-actions .mat-stroked-button.mat-primary').click();
    cy.get('.ParametersForm-incentiveMode-actions .mat-stroked-button.mat-primary').click();
    cy.get('.ParametersForm-incentiveMode-actions .mat-stroked-button.mat-primary').click();

    // delete the second

    cy.get(
      '.ParametersForm-incentiveMode-value:nth-child(3) .ParametersForm-incentiveMode-value-remove .mat-icon',
    ).click({ force: true });

    // check it has been deleted
    cy.get('.ParametersForm-incentiveMode-value:nth-child(5)').should('not.exist');

    // define distance split
    cy.get('.ParametersForm-incentiveMode-value:nth-child(2) > .ParametersForm-incentiveMode-staggered input').type(
      '10',
    );
    cy.get('.ParametersForm-incentiveMode-value:nth-child(3) > .ParametersForm-incentiveMode-staggered input').type(
      '30',
    );

    // first block -----------------

    // define amount

    cy.get(
      '.ParametersForm-incentiveMode-value:nth-child(2) app-retribution-form:nth-child(1)  .mat-form-field-flex input',
    ).type('2');
    cy.get(
      '.ParametersForm-incentiveMode-value:nth-child(2) app-retribution-form:nth-child(2) .mat-form-field-flex input',
    ).type('6');

    // test on first split variation

    // select first checkbox of first block 'par passager'
    cy.get(
      // eslint-disable-next-line
      '.ParametersForm-incentiveMode-value:nth-child(2) app-retribution-form:nth-child(1) .mat-checkbox:nth-child(5) .mat-checkbox-layout',
    ).click({ force: true });
    // select first checkbox of sec block 'par km'
    cy.get(
      // eslint-disable-next-line
      '.ParametersForm-incentiveMode-value:nth-child(2) app-retribution-form:nth-child(2) .mat-checkbox:nth-child(4) .mat-checkbox-layout',
    ).click({ force: true });

    // sec block -----------------

    cy.get(
      '.ParametersForm-incentiveMode-value:nth-child(3) app-retribution-form:nth-child(1)  .mat-form-field-flex input',
    ).type('10');
    cy.get(
      '.ParametersForm-incentiveMode-value:nth-child(3) app-retribution-form:nth-child(2) .mat-form-field-flex input',
    ).type('0');

    // third block -----------------

    cy.get(
      '.ParametersForm-incentiveMode-value:nth-child(4) app-retribution-form:nth-child(1)  .mat-form-field-flex input',
    ).type('0');
    cy.get(
      '.ParametersForm-incentiveMode-value:nth-child(4) app-retribution-form:nth-child(2) .mat-form-field-flex input',
    ).type('11');

    cy.get(
      // eslint-disable-next-line
      '.ParametersForm-incentiveMode-value:nth-child(4) app-retribution-form:nth-child(2) .mat-checkbox:nth-child(2) .mat-checkbox-layout',
    ).click({ force: true });
  });
  campaignThirdStepClickNextStep();

  //  ---------------------------------------

  it('final copy validation', () => {
    cy.get('#summary').contains('De 0 à 10 km');
    cy.get('#summary').contains(
      '2 € par trajet par passager pour le conducteur 6 € par trajet par km pour le(s) passager(s).',
    );
    cy.get('#summary').contains('De 10 à 30 km ');
    cy.get('#summary').contains('10 € par trajet pour le conducteur.');
    cy.get('#summary').contains('À partir de 30 km');
    cy.get('#summary').contains('gratuit pour le(s) passager(s).');
  });

  // LAST STEP
  it('sets name of form', () => {
    // save screenshot to validate text
    cy.screenshot();

    cy.get('.SummaryForm mat-form-field:first-child input').type(CypressExpectedCampaign.campaignName);
  });

  it('sets description of form', () => {
    cy.get('.SummaryForm mat-form-field:nth-child(2) textarea').type(CypressExpectedCampaign.description);
  });

  it('clicks button to save campaign', () => {
    cy.server();

    cy.get('.SummaryForm .SummaryForm-actions button:nth-of-type(1)').click();

    if (!e2e) {
      cy.wait('@campaignCreate').then((xhr) => {
        const method = xhr.request.body[0].method;

        expect(method).equal('campaign:create');
        const expectedCampaign = CypressExpectedCampaign.get();

        delete expectedCampaign.parent_id;
        delete expectedCampaign._id;
      });
    }
  });

  closeNotification();
}

export function cypress_campaignCreate(e2e = false): void {
  it('clicks on campaign section', () => {
    cy.get('.Header-menu .Header-menu-item:first-child').click();
  });

  it('clicks button to create new campaign', () => {
    cy.get('.CampaignDashboard-trips-header button').click();
    cy.wait(2000);
  });

  // FIRST STEP
  campaignFirstStepCustom();

  // click previous step
  campaignThirdStepClickPreviousStep();

  // uncheck passenger
  campaignSecondStepSelectTargets(true, false);

  campaignSecondStepClickNextStep();

  campaignThirdStepClickNextStep();

  // LAST STEP
  it('sets name of form', () => {
    // save screenshot to validate text
    cy.screenshot();

    cy.get('.SummaryForm mat-form-field:first-child input').type(CypressExpectedCampaign.campaignName);
  });

  it('sets description of form', () => {
    cy.get('.SummaryForm mat-form-field:nth-child(2) textarea').type(CypressExpectedCampaign.description);
  });

  it('clicks button to save campaign', () => {
    cy.server();

    cy.get('.SummaryForm .SummaryForm-actions button:nth-of-type(1)').click();

    if (!e2e) {
      cy.wait('@campaignCreate').then((xhr) => {
        const method = xhr.request.body[0].method;

        expect(method).equal('campaign:create');
        const expectedCampaign = CypressExpectedCampaign.get();

        delete expectedCampaign.parent_id;
        delete expectedCampaign._id;
      });
    }
  });

  closeNotification();
}
