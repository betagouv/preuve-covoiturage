import { CypressExpectedCampaign } from '../../apiValues/expectedCampaign';
import { closeNotification } from '../notification.cypress';

export function cypress_campaignLaunch(e2e = false) {
  it('clicks on campaign section', () => {
    cy.get('.Header-menu .Header-menu-item:first-child').click();
  });

  it('clicks on launch button', () => {
    cy.get(
      '.draftList app-list-item:first-child .ListItem:first-child .CampaignsList-item-actions button:nth-child(1)',
    ).click();
  });

  it('clicks on launch', () => {
    cy.get('.campaignDraftView-header-message button').click();
  });

  it('confirm', () => {
    cy.server();

    cy.get('app-confirm-dialog button:nth-child(2)').click();

    if (!e2e) {
      cy.wait('@campaignLaunch').then((xhr) => {
        const params = xhr.request.body[0].params;
        const method = xhr.request.body[0].method;

        expect(method).equal('campaign:launch');
        expect(params).eql({
          _id: CypressExpectedCampaign.getLaunched()._id,
        });
      });
    }
  });

  closeNotification();
}
