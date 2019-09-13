/// <reference types="Cypress" />

import { campaignFirstStepCustom } from '../../support/reusables/steps/campaign-create-first-step';
import {
  campaignSecondStepCheckDisabledNextStep,
  campaignSecondStepClickNextStep,
  campaignSecondStepSelectDays,
  campaignSecondStepSelectOperators,
  campaignSecondStepSelectRange,
  campaignSecondStepSelectRanks,
  campaignSecondStepSelectTargets,
} from '../../support/reusables/steps/campaign-create-second-step';
import {
  campaignThirdStepCheckDisabledNextStep,
  campaignThirdStepClickNextStep,
  campaignThirdStepSetDates,
  campaignThirdStepSetMaxRetribution,
  campaignThirdStepSetMaxTrips,
  campaignThirdStepSetUnit,
} from '../../support/reusables/steps/campaign-create-third-step';
import { CypressExpectedCampaign } from '../../support/formValues/expectedCampaign';

export function cypress_campaignCreate() {
  const expectedCampaign = new CypressExpectedCampaign();

  // FIRST STEP
  campaignFirstStepCustom();

  // SECOND STEP
  campaignSecondStepSelectDays();

  campaignSecondStepSelectRange();

  campaignSecondStepSelectRanks();

  campaignSecondStepSelectTargets();

  // make sure step is complete
  campaignSecondStepCheckDisabledNextStep();

  campaignSecondStepSelectOperators();

  campaignSecondStepClickNextStep();

  // THIRD STEP
  campaignThirdStepSetMaxRetribution(expectedCampaign.maxAmount.toString());

  campaignThirdStepSetUnit();

  campaignThirdStepSetDates(
    expectedCampaign.startMoment.format('DD/MM/YYYY'),
    expectedCampaign.endMoment.format('DD/MM/YYYY'),
  );

  campaignThirdStepSetMaxTrips(expectedCampaign.maxTrips.toString());

  campaignThirdStepCheckDisabledNextStep();

  it('sets retribution', () => {
    // open retribution extension
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(5)').click();

    // passenger amount
    cy.get('.ParametersForm-incentiveMode-value-inputs app-retribution-form:first-child mat-form-field input').type(
      expectedCampaign.forPassengerAmount.toString(),
    );

    // press 'par km'
    cy.get(
      '.ParametersForm-incentiveMode-value-inputs app-retribution-form:first-child mat-checkbox:first-of-type .mat-checkbox-layout',
    ).click();

    // driver amount
    cy.get('.ParametersForm-incentiveMode-value-inputs app-retribution-form:nth-child(2) mat-form-field input').type(
      expectedCampaign.forDriverAmount.toString(),
    );
  });

  campaignThirdStepClickNextStep();

  // LAST STEP
  it('sets name of form', () => {
    cy.get('.SummaryForm mat-form-field:first-child input').type("Nouvelle campagne d'incitation");
  });

  it('clicks button to launch campaign', () => {
    cy.get('.SummaryForm .SummaryForm-actions button:first-child').click();
  });

  it('confirm', () => {
    cy.server();

    cy.route({
      method: 'POST',
      url: '/rpc?methods=campaign:create',
    }).as('campaignCreate');

    cy.get('app-confirm-dialog button:nth-child(2)').click();

    cy.wait('@campaignCreate').then((xhr) => {
      const params = xhr.request.body[0].params;
      const method = xhr.request.body[0].method;

      expect(method).equal('campaign:create');
      expect(params).eql(expectedCampaign.get());
    });
  });
}
