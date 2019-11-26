export function cypress_campaign_list() {
  it('clicks on campaign section', () => {
    cy.get('.Header-menu .Header-menu-item:first-child').click();
    cy.pause();
  });
}
