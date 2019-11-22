import { closeNotification } from '../notification.cypress';
import { CypressExpectedTemplates } from '../../expectedApiPayload/expectedTemplates';

export function cypress_campaignEditCreatedFromTemplate() {
  it('clicks on campaign section', () => {
    cy.get('.Header-menu .Header-menu-item:first-child').click();
  });
  it('clicks on edit button', () => {
    cy.get(
      '.draftList app-list-item:first-child .ListItem:first-child .CampaignsList-item-actions button:nth-child(2)',
    ).click();
  });

  it('clicks button to save campaign', () => {
    cy.get('.SummaryForm .SummaryForm-actions button:nth-of-type(1)').click();
  });

  closeNotification();
}
