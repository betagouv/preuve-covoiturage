import { campaignThirdStepClickNextStep, campaignThirdStepClickPreviousStep } from './steps/campaign-create-third-step';
import { campaignSecondStepClickNextStep, campaignSecondStepSelectTargets } from './steps/campaign-create-second-step';
import { CypressExpectedCampaign } from '../../expectedApiPayload/expectedCampaign';
import { closeNotification } from '../notification.cypress';

export function cypress_campaignEdit(e2e = false): void {
  it('clicks on campaign section', () => {
    cy.get('.Header-menu .Header-menu-item:first-child').click();
  });
  it('clicks on edit button', () => {
    cy.get(
      '.draftList app-list-item:first-child .ListItem:first-child .CampaignsList-item-actions button:nth-child(1)',
    ).click();
  });

  it('clicks on edit retribution', () => {
    cy.get('.campaignRetributionView button').click();
  });

  // click previous step
  campaignThirdStepClickPreviousStep();

  // check passenger
  campaignSecondStepSelectTargets(true, false);

  campaignSecondStepClickNextStep();

  // passenger amount
  it('sets incitation for passenger', () => {
    // open retribution extension
    cy.wait(3000);
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(5)').click();

    cy.get('.RetributionForm-inputs > .shortFormField > .mat-form-field-wrapper > .mat-form-field-flex input')
      .clear()
      .type((CypressExpectedCampaign.afterEditionForPassengerAmount / 100).toString());
  });

  campaignThirdStepClickNextStep();

  it('clicks button to save campaign', () => {
    cy.server();

    cy.get('.SummaryForm .SummaryForm-actions button:nth-of-type(1)').click();

    if (!e2e) {
      cy.wait('@campaignPatch').then((xhr) => {
        const method = xhr.request.body[0].method;

        expect(method).equal('campaign:patch');
        const expectedCampaign = CypressExpectedCampaign.getAfterEdition();

        delete expectedCampaign.parent_id;
        delete expectedCampaign.status;
        delete expectedCampaign.territory_id;
      });
    }
  });

  closeNotification();
}
