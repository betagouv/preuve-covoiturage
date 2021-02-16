describe('My First Test', () => {
    it('clicking "type" shows the right headings', () => {
      cy.visit('/')
  
      cy.pause()
      
      cy.get('.Login-title').should('have.text', 'Le registre de preuve de covoiturage')
      // cy.get('.action-email')
      //   .type('fake@email.com')
      //   .should('have.value', 'fake@email.com')
    })
  })