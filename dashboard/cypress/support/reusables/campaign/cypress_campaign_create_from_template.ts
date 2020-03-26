/// <reference types="Cypress" />
import { campaignFirstStepTemplate } from './steps/campaign-create-first-step';
import {
  campaignSecondStepClickNextStep,
  campaignSecondStepSelectOperators,
} from './steps/campaign-create-second-step';
import {
  campaignThirdStepCheckDisabledNextStep,
  campaignThirdStepClickNextStep,
  campaignThirdStepSetDates,
  campaignThirdStepSetMaxRetribution,
  campaignThirdStepSetMaxTrips,
} from './steps/campaign-create-third-step';
import { closeNotification } from '../notification.cypress';
import { CypressExpectedTemplates } from '../../expectedApiPayload/expectedTemplates';
import { CypressExpectedCampaign } from '../../expectedApiPayload/expectedCampaign';

export function cypress_campaignCreateFromTemplate(templateIndex: number, e2e = false): void {
  it('clicks on campaign section', () => {
    cy.get('.Header-menu .Header-menu-item:first-child').click();
  });

  it('clicks button to create new campaign', () => {
    cy.get('.CampaignDashboard-trips-header button').click();
  });

  // FIRST STEP
  campaignFirstStepTemplate(templateIndex);

  // SECOND STEP
  // make sure next step button is disabled
  // campaignSecondStepCheckDisabledNextStep();

  campaignSecondStepSelectOperators();

  campaignSecondStepClickNextStep();

  // THIRD STEP
  campaignThirdStepSetMaxRetribution(CypressExpectedTemplates.maxAmount.toString());

  // make sure next step button is disabled
  campaignThirdStepCheckDisabledNextStep();

  campaignThirdStepSetDates(
    CypressExpectedTemplates.startMoment.format('DD/MM/YYYY'),
    CypressExpectedTemplates.endMoment.format('DD/MM/YYYY'),
  );

  campaignThirdStepSetMaxTrips(CypressExpectedCampaign.maxTrips.toString());

  campaignThirdStepClickNextStep();

  it('clicks button to save campaign', () => {
    cy.get('.SummaryForm .SummaryForm-actions button:nth-of-type(1)').click();

    if (!e2e) {
      cy.wait('@campaignCreate').then((xhr) => {
        const method = xhr.request.body[0].method;

        expect(method).equal('campaign:create');
        const expectedCampaign = CypressExpectedTemplates.get()[templateIndex];

        delete expectedCampaign._id;
      });
    }
  });

  closeNotification();
}
