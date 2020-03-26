export function campaignFirstStepCustom(): void {
  it('chooses campaign', () => {
    // select custom campaign
    cy.get('.CampaignTemplates-custom > a').click({ force: true });
  });
}

export function campaignFirstStepTemplate(index: number): void {
  it(`chooses campaign from template ${index + 1}`, () => {
    cy.get(`.CampaignTemplates-templateCard:nth-child(${index + 1})`).click({ force: true });
  });
}
