import { stubCampaignTemplateList } from '../../../stubs/campaign/campaign-template.list';

export function campaignFirstStepCustom() {
  it('chooses campaign', () => {
    // select custom campaign
    cy.get('.CampaignTemplates-custom > a').click();
  });
}

export function campaignFirstStepTemplate(index: number) {
  it(`chooses campaign from template ${index + 1}`, () => {
    cy.get(`.CampaignTemplates-templateCard:nth-child(${index + 1})`).click();
  });
}
