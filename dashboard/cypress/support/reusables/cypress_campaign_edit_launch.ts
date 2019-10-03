import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { CypressExpectedCampaign } from '../apiValues/expectedCampaign';

export function cypress_campaignEditAndLauch() {
  // change template
  // change to points
  // add time
  // change to per_trip

  it('clicks button to launch campaign', () => {
    cy.get('.SummaryForm .SummaryForm-actions button:first-child').click();
  });

  it('confirm', () => {
    cy.server();

    cy.route({
      method: 'POST',
      url: '/rpc?methods=campaign:launch',
    }).as('campaignLaunch');

    cy.get('app-confirm-dialog button:nth-child(2)').click();

    cy.wait('@campaignLaunch').then((xhr) => {
      const params = xhr.request.body[0].params;
      const method = xhr.request.body[0].method;

      expect(method).equal('campaign:launch');
      expect(params).eql({
        ...CypressExpectedCampaign.get(),
        status: CampaignStatusEnum.DRAFT,
      });
    });
  });
}
