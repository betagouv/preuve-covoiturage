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
import { endMoment, expectedCampaign, startMoment } from '../../support/formValues/expectedCampaign';

export function Cypress_campaignCreate() {
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
  campaignThirdStepSetMaxRetribution(expectedCampaign.max_amount.toString());

  campaignThirdStepSetUnit();

  campaignThirdStepSetDates(startMoment.format('DD/MM/YYYY'), endMoment.format('DD/MM/YYYY'));

  campaignThirdStepSetMaxTrips(expectedCampaign.max_trips.toString());

  campaignThirdStepCheckDisabledNextStep();

  it('sets retribution', () => {
    // open retribution extension
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(5)').click();

    // passenger amount
    cy.get('.ParametersForm-incentiveMode-value-inputs app-retribution-form:first-child mat-form-field input').type(
      '0.1',
    );

    // press 'par km'
    cy.get(
      '.ParametersForm-incentiveMode-value-inputs app-retribution-form:first-child mat-checkbox:first-of-type .mat-checkbox-layout',
    ).click();

    // driver amount
    cy.get('.ParametersForm-incentiveMode-value-inputs app-retribution-form:nth-child(2) mat-form-field input').type(
      '0.2',
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
      expect(new Date(params.start)).eql(expectedCampaign.start);
      expect(new Date(params.end)).eql(expectedCampaign.end);
      expect(params.name).eql(expectedCampaign.name);
      expect(params.description).eql(expectedCampaign.description);
      expect(params.status).eql(expectedCampaign.status);
      expect(params.rules).eql(expectedCampaign.rules);
      expect(params.trips_number).eql(expectedCampaign.trips_number);
      expect(params.formula_expression).include('0.1 € par trajet par km');
      expect(params.formula_expression).include('0.2 € par trajet pour le(s) passager(s)');
      expect(params.formulas).eql(expectedCampaign.formulas);
      expect(params.max_amount).eql(expectedCampaign.max_amount);
      expect(params.max_trips).eql(expectedCampaign.max_trips);
      expect(params.template_id).eql(expectedCampaign.template_id);
      expect(params.amount_unit).eql(expectedCampaign.amount_unit);
      expect(params.expertMode).eql(expectedCampaign.expertMode);
    });
  });
}
