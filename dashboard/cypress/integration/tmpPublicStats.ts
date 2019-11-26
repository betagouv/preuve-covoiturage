context('TMP PUBLIC STATS', () => {
  beforeEach(() => {
    cy.server();
    cy.fixture('tmpPublicStats').as('tmpPublicStats');
    cy.route('GET', '/stats', '@tmpPublicStats');
  });

  it('Go to tmp public stats page', () => {
    cy.visit('/stats');
  });
});
