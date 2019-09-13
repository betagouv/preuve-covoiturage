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
  campaignThirdStepSetDates,
  campaignThirdStepSetMaxRetribution,
  campaignThirdStepSetMaxTrips,
  campaignThirdStepSetUnit,
} from '../../support/reusables/steps/campaign-create-third-step';
import { CypressExpectedCampaign } from '../formValues/expectedCampaign';
import { stubCampaignCreate } from '../stubs/campaign.create';

export function cypress_campaignCreate() {
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
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(5)').click();

    // driver amount
    cy.get('.ParametersForm-incentiveMode-value-inputs app-retribution-form:first-child mat-form-field input').type(
      CypressExpectedCampaign.forDriverAmount.toString(),
    );

    // press 'par km'
    cy.get(
      '.ParametersForm-incentiveMode-value-inputs app-retribution-form:first-child mat-checkbox:first-of-type .mat-checkbox-layout',
    ).click();

    // passenger amount
    cy.get('.ParametersForm-incentiveMode-value-inputs app-retribution-form:nth-child(2) mat-form-field input').type(
      CypressExpectedCampaign.forPassengerAmount.toString(),
    );
  });

  campaignThirdStepClickNextStep();

  // LAST STEP
  it('sets name of form', () => {
    cy.get('.SummaryForm mat-form-field:first-child input').type("Nouvelle campagne d'incitation");
  });

  it('clicks button to save campaign', () => {
    cy.server();

    stubCampaignCreate(CampaignStatusEnum.DRAFT);

    cy.get('.SummaryForm .SummaryForm-actions button:nth-of-type(2)').click();

    cy.wait('@campaignCreate').then((xhr) => {
      const params = xhr.request.body[0].params;
      const method = xhr.request.body[0].method;

      expect(method).equal('campaign:create');
      expect(params).eql({
        ...CypressExpectedCampaign.get(),
        status: CampaignStatusEnum.DRAFT,
      });
    });
  });
}
