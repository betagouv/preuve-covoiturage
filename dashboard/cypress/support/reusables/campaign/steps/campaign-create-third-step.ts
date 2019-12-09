import { CypressExpectedCampaign } from '../../../expectedApiPayload/expectedCampaign';

export function campaignThirdStepSetMaxRetribution(maxRetribution: string) {
  it('sets max retribution', () => {
    // open MAX RETRIBUTION extension
    cy.get('.ParametersForm .ParametersForm-maxRetribution mat-form-field:first-child input').type(maxRetribution);
  });
}

export function campaignThirdStepSetUnit() {
  it('sets retribution unit: €', () => {
    cy.get('.ParametersForm .ParametersForm-maxRetribution mat-form-field:nth-child(2)').click();

    // select euros
    cy.get('.mat-select-panel mat-option:first-child').click();

    // focus out of material select
    cy.get('.cdk-overlay-backdrop').click({ force: true });
  });
}

export function campaignThirdStepSetDates(start: string, end: string) {
  it('sets start & end dates', () => {
    // open extension
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(2) mat-expansion-panel-header').click();

    // open START DATE
    cy.get('.ParametersForm .ParametersForm-date mat-form-field:first-child input').type(start);

    // open END DATE
    cy.get('.ParametersForm .ParametersForm-date mat-form-field:nth-child(2) input').type(end);
  });
}

export function campaignThirdStepSetMaxTrips(maxTrips) {
  it('sets max trips', () => {
    // open extension
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(3) mat-expansion-panel-header').click();

    cy.get('.ParametersForm .ParametersForm-maxTrips mat-form-field input').type(maxTrips);
  });
}

export function campaignThirdStepClickPreviousStep() {
  it('clicks on previous step to go to step 3', () => {
    cy.get('.mat-horizontal-stepper-content:nth-child(3)  .CampaignForm-content-actions button:nth-child(1)').click();
  });
}

export function campaignThirdStepClickNextStep() {
  it('clicks on next step to go to step 4', () => {
    cy.get('.mat-horizontal-stepper-content:nth-child(3)  .CampaignForm-content-actions button:nth-child(2)').click();
  });
}

export function campaignThirdStepCheckDisabledNextStep() {
  it('check button to go to step 4 is disabled', () => {
    cy.get('.mat-horizontal-stepper-content:nth-child(3)  .CampaignForm-content-actions button:nth-child(2)').should(
      'be.disabled',
    );
  });
}

export function campaignThirdStepSetRestriction(
  restrictionIndex: number,
  amount: number,
  targetIndex: number,
  periodIndex: number,
) {
  it('set new restriction', () => {
    // click add new
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(4) .CampaignSubForm-inputs > button').click();
    cy.wait(500);

    // set amount
    cy.get(`.ParametersForm-restriction:nth-child(${restrictionIndex}) .RestrictionForm-howMuch input`).type(
      amount.toString(),
    );

    // select passenger
    cy.get(`.ParametersForm-restriction:nth-child(${restrictionIndex}) .RestrictionForm-who`).click();
    cy.get(`.mat-select-panel mat-option:nth-child(${targetIndex})`).click();

    cy.wait(300); // to avoid select multiple bug

    // select period
    cy.get(`.ParametersForm-restriction:nth-child(${restrictionIndex}) .RestrictionForm-period`).click();
    cy.get(`.mat-select-panel mat-option:nth-child(${periodIndex})`).click();
  });
}
