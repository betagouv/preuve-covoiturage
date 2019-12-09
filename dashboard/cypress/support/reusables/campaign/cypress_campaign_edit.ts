import { campaignThirdStepClickNextStep, campaignThirdStepClickPreviousStep } from './steps/campaign-create-third-step';
import {
  campaignSecondStepAddSecondTimeRange,
  campaignSecondStepClickNextStep,
  campaignSecondStepSelectTargets,
  campaignSecondStepSelectTimeRange,
} from './steps/campaign-create-second-step';
import { CypressExpectedCampaign } from '../../expectedApiPayload/expectedCampaign';
import { closeNotification } from '../notification.cypress';
import { campaignFourthStepClickPreviousStep } from './steps/campaign-create-fourth-step';

export function cypress_campaignEdit(e2e = false) {
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
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(5)').click();

    cy.get('.ParametersForm-incentiveMode-value-inputs app-retribution-form:nth-child(2) mat-form-field input')
      .clear()
      .type((CypressExpectedCampaign.afterEditionForPassengerAmount / 100).toString());
  });

  it('click toggle', () => {
    cy.get('.ParametersForm-incentiveMode mat-slide-toggle').click();
  });

  it('add staggered step', () => {
    cy.get('.ParametersForm-incentiveMode-actions button').click();
  });

  // set staggered distance
  it('set staggered distance', () => {
    cy.get('.ParametersForm-incentiveMode-staggered:first-child app-staggered-form input').type(
      (CypressExpectedCampaign.staggeredDistance / 1000).toString(),
    );
  });

  // driver amount after 5 km
  it('sets incitation for driver', () => {
    cy.get(
      '.ParametersForm-incentiveMode-value:nth-child(3) .ParametersForm-incentiveMode-value-inputs app-retribution-form:nth-child(1) mat-form-field input',
    )
      .clear()
      .type((CypressExpectedCampaign.afterEditionForDriverAmount5km / 100).toString());
  });

  // passenger amount after 5 km
  it('sets incitation for passenger', () => {
    cy.get(
      '.ParametersForm-incentiveMode-value:nth-child(3) .ParametersForm-incentiveMode-value-inputs app-retribution-form:nth-child(2) mat-form-field input',
    )
      .clear()
      .type((CypressExpectedCampaign.afterEditionForPassengerAmount5km / 100).toString());
  });

  campaignThirdStepClickNextStep();

  it('clicks button to save campaign', () => {
    cy.server();

    cy.get('.SummaryForm .SummaryForm-actions button:nth-of-type(1)').click();

    if (!e2e) {
      cy.wait('@campaignPatch').then((xhr) => {
        const params = xhr.request.body[0].params;
        const method = xhr.request.body[0].method;

        expect(method).equal('campaign:patch');
        const expectedCampaign = CypressExpectedCampaign.getAfterEdition();

        delete expectedCampaign.parent_id;
        delete expectedCampaign.status;
        delete expectedCampaign.territory_id;

        const { _id, ...campaignProperties } = expectedCampaign;

        expect(params).eql({
          _id: expectedCampaign._id,
          patch: campaignProperties,
        });
      });
    }
  });

  closeNotification();
}
