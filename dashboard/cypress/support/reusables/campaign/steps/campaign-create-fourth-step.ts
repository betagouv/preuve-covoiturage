export function campaignFourthStepClickPreviousStep() {
  it('clicks on previous step to go to step 3', () => {
    cy.get('.mat-horizontal-stepper-content:nth-child(4)  .CampaignForm-content-actions button:nth-child(1)').click();
  });
}
