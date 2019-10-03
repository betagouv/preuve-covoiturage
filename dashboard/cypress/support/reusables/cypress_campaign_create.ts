import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';

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
  campaignThirdStepClickPreviousStep,
  campaignThirdStepSetDates,
  campaignThirdStepSetMaxRetribution,
  campaignThirdStepSetMaxTrips,
  campaignThirdStepSetUnit,
} from '../../support/reusables/steps/campaign-create-third-step';
import { CypressExpectedCampaign } from '../apiValues/expectedCampaign';
import { stubCampaignCreate } from '../stubs/campaign.create';

export function cypress_campaignCreate() {
  // FIRST STEP
  campaignFirstStepCustom();

  // SECOND STEP
  campaignSecondStepSelectDays();

  campaignSecondStepSelectRange();

  campaignSecondStepSelectRanks();

  campaignSecondStepSelectTargets(true, true);

  // make sure step is complete
  campaignSecondStepCheckDisabledNextStep();

  campaignSecondStepSelectOperators();

  campaignSecondStepClickNextStep();

  // THIRD STEP
  campaignThirdStepSetMaxRetribution(CypressExpectedCampaign.maxAmount.toString());

  campaignThirdStepSetUnit();

  campaignThirdStepSetDates(
    CypressExpectedCampaign.startMoment.format('DD/MM/YYYY'),
    CypressExpectedCampaign.endMoment.format('DD/MM/YYYY'),
  );

  campaignThirdStepSetMaxTrips(CypressExpectedCampaign.maxTrips.toString());

  campaignThirdStepCheckDisabledNextStep();

  it('sets retribution', () => {
    // open retribution extension
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(4)').click();

    // driver amount
    cy.get('.ParametersForm-incentiveMode-value-inputs app-retribution-form:first-child mat-form-field input').type(
      (CypressExpectedCampaign.forDriverAmount / 100).toString(),
    );

    // press 'par km'
    cy.get(
      '.ParametersForm-incentiveMode-value-inputs app-retribution-form:first-child mat-checkbox:first-of-type .mat-checkbox-layout',
    ).click();

    // passenger amount
    cy.get('.ParametersForm-incentiveMode-value-inputs app-retribution-form:nth-child(2) mat-form-field input').type(
      '0.2',
    );
  });

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

    cy.wait('@campaignCreate').then((xhr) => {
      const params = xhr.request.body[0].params;
      const method = xhr.request.body[0].method;

      expect(method).equal('campaign:create');
      const expectedCampaign = CypressExpectedCampaign.get();

      delete expectedCampaign.parent_id;
      delete expectedCampaign._id;

      expect(params).eql(expectedCampaign);
    });
  });
}
