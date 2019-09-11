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
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(2)').click();

    // open START DATE
    cy.get('.ParametersForm .ParametersForm-date mat-form-field:first-child input').type(start);

    // open END DATE
    cy.get('.ParametersForm .ParametersForm-date mat-form-field:nth-child(2) input').type(end);
  });
}

export function campaignThirdStepSetMaxTrips(maxTrips) {
  it('sets max trips', () => {
    // open extension
    cy.get('.ParametersForm .mat-expansion-panel:nth-child(3)').click();

    cy.get('.ParametersForm .ParametersForm-maxTrips mat-form-field input').type(maxTrips);
  });
}

export function campaignThirdStepClickNextStep() {
  it('clicks on next step to go to step 4', () => {
    cy.get('.mat-horizontal-stepper-content:nth-child(3)  .CampaignForm-content-actions button:nth-child(2)').click();

    // save screenshot to validate text
    cy.screenshot();
  });
}

export function campaignThirdStepCheckDisabledNextStep() {
  it('check button to go to step 4 is disabled', () => {
    cy.get('.mat-horizontal-stepper-content:nth-child(3)  .CampaignForm-content-actions button:nth-child(2)').should(
      'be.disabled',
    );
  });
}
