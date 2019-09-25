import { campaignThirdStepClickNextStep, campaignThirdStepClickPreviousStep } from './steps/campaign-create-third-step';
import { campaignSecondStepClickNextStep, campaignSecondStepSelectTargets } from './steps/campaign-create-second-step';
import { CypressExpectedCampaign } from '../formValues/expectedCampaign';

export function cypress_campaignEdit() {
  it('clicks on edit button', () => {
    cy.get('.draftList .ListItem:first-child .CampaignsList-item-actions button:nth-child(2)').click();
  });

  // click previous step
  campaignThirdStepClickPreviousStep();

  // check passenger
  campaignSecondStepSelectTargets(true, false);

  campaignSecondStepClickNextStep();

  // passenger amount
  it('sets incitation for passenger', () => {
    // open retribution extension
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(4)').click();

    cy.get('.ParametersForm-incentiveMode-value-inputs app-retribution-form:nth-child(2) mat-form-field input').type(
      (CypressExpectedCampaign.afterEditionForPassengerAmount / 100).toString(),
    );
  });

  campaignThirdStepClickNextStep();

  it('clicks button to save campaign', () => {
    cy.server();

    cy.get('.SummaryForm .SummaryForm-actions button:nth-of-type(1)').click();

    cy.wait('@campaignPatch').then((xhr) => {
      const params = xhr.request.body[0].params;
      const method = xhr.request.body[0].method;

      expect(method).equal('campaign:patch');
      const expectedCampaign = CypressExpectedCampaign.getAfterEdition();

      delete expectedCampaign.parent_id;

      const { _id, ...campaignProperties } = expectedCampaign;

      expect(params).eql({
        _id: expectedCampaign._id,
        patch: campaignProperties,
      });
    });
  });
}
