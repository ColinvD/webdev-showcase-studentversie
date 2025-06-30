describe('Racing Game', () => {
  beforeEach(() => {
    cy.visit('http://localhost:7150/Game'); // URL naar je spelpagina
  })

  it("Register normal player",()=>{
    cy.get('a').contains('Registreren').click()
    cy.url().should('include', '/Register')

    cy.get('#Username').type('Cypress')
    cy.get('#Username').should('have.value', 'Cypress')

    cy.get('#Email').type('fake@email.com')
    cy.get('#Email').should('have.value', 'fake@email.com')

    cy.get('#PasswordHash').type('Cypress')
    cy.get('#PasswordHash').should('have.value', 'Cypress')

    cy.get('select').select('Normale Speler').should('have.value', 'Normal')
    cy.get('form').submit()
    cy.url().should('include', '/Login')
  })

  it("Register paid player",()=>{
    cy.get('a').contains('Registreren').click()
    cy.url().should('include', '/Register')

    cy.get('#Username').type('CypressPaid')
    cy.get('#Username').should('have.value', 'CypressPaid')

    cy.get('#Email').type('fake2@email.com')
    cy.get('#Email').should('have.value', 'fake2@email.com')

    cy.get('#PasswordHash').type('CypressPaid')
    cy.get('#PasswordHash').should('have.value', 'CypressPaid')

    cy.get('select').select('Betaalde Speler').should('have.value', 'Paid')
    cy.get('form').submit()
    cy.url().should('include', '/Login')
  })

  it('Toont gebruikersnaam', () => {
    cy.get('a').contains('Inloggen').click()
    cy.get('#Email').type('fake@email.com')
    cy.get('#Email').should('have.value', 'fake@email.com')

    cy.get('#PasswordHash').type('Cypress')
    cy.get('#PasswordHash').should('have.value', 'Cypress')
    cy.get('form').submit()
    cy.url().should('include', '/Play')
    cy.get('#username-label').should('contain.text', 'Ingelogd als:')
  })

  it('Laadt Phaser container', () => {
    cy.get('a').contains('Inloggen').click()
    cy.get('#Email').type('fake@email.com')
    cy.get('#Email').should('have.value', 'fake@email.com')

    cy.get('#PasswordHash').type('Cypress')
    cy.get('#PasswordHash').should('have.value', 'Cypress')
    cy.get('form').submit()
    cy.url().should('include', '/Play')
    cy.get('#phaser-container').should('exist')
  })

  it('Activeert boost alleen voor Boost-gebruikers', () => {
    cy.get('a').contains('Inloggen').click()
    cy.get('#Email').type('fake2@email.com')
    cy.get('#Email').should('have.value', 'fake2@email.com')

    cy.get('#PasswordHash').type('CypressPaid')
    cy.get('#PasswordHash').should('have.value', 'CypressPaid')
    cy.get('form').submit()
    cy.url().should('include', '/Play')
    cy.get('#phaser-container')
      .invoke('attr', 'data-role')
      .then((roles) => {
        const hasBoost = roles.includes('Betaald')
        if (hasBoost) {
          cy.log('Gebruiker mag boosten')
        } else {
          cy.log('Gebruiker mag NIET boosten')
        }
      })
  })
  it('Heeft geen boost alleen voor Boost-gebruikers', () => {
    cy.get('a').contains('Inloggen').click()
    cy.get('#Email').type('fake@email.com')
    cy.get('#Email').should('have.value', 'fake@email.com')

    cy.get('#PasswordHash').type('Cypress')
    cy.get('#PasswordHash').should('have.value', 'Cypress')
    cy.get('form').submit()
    cy.url().should('include', '/Play')
    cy.get('#phaser-container')
      .invoke('attr', 'data-role')
      .then((roles) => {
        const hasBoost = roles.includes('Betaald')
        if (hasBoost) {
          cy.log('Gebruiker mag boosten')
        } else {
          cy.log('Gebruiker mag NIET boosten')
        }
      })
  })
})