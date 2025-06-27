describe('General Showcase', () => {
  beforeEach(() => {
    cy.visit('https://localhost:7150'); // URL naar je spelpagina
  })
  it('Gets, types and asserts contactpage', () => {
    cy.contains('Contact').click()
    cy.url().should('include', '/Contact')
    
    cy.get('#firstname').type('cypress')
    cy.get('#firstname').should('have.value', 'cypress')
    
    cy.get('#lastname').type('tester')
    cy.get('#lastname').should('have.value', 'tester')

    cy.get('#email').type('fake@email.com')
    cy.get('#email').should('have.value', 'fake@email.com')

    cy.get('#phone').type('0123456789')
    cy.get('#phone').should('have.value', '0123456789')

    cy.get('#subject').type('Testing')
    cy.get('#subject').should('have.value', 'Testing')

    cy.get('#message').type('This is a test.')
    cy.get('#message').should('have.value', 'This is a test.')
  })

  it('Visits showcase', ()=>{
    cy.get('.person-name').contains('Colin van Dongen')
  })
  it('Visits privacy', ()=>{
    cy.contains('Privacy').click()
    cy.get('h1').contains('Privacy Policy')
  })
  it('Visits game', ()=>{
    cy.contains('Game').click()
    cy.get('h1').contains('Welkom bij de Racing Game')
  })
})