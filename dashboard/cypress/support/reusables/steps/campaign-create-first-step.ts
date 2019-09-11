export function campaignFirstStepCustom() {
  it('chooses campaign', () => {
    // select custom campaign
    cy.get('.CampaignTemplates-custom > a').click();
  });
}
