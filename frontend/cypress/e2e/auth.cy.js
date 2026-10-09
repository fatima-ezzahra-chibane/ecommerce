describe('Authentification', () => {
  it('inscription d’un nouveau client puis déconnexion', () => {
    const email = `e2e${Date.now()}@test.com`;
    cy.visit('/register');
    cy.get('input[placeholder="Nom"]').type('Client E2E');
    cy.get('input[placeholder="Email"]').type(email);
    cy.get('input[placeholder="Mot de passe"]').type('password123');
    cy.get('input[placeholder="Confirmer"]').type('password123');
    cy.contains('button', 'Créer mon compte').click();

    cy.url().should('include', '/shop');
    cy.contains('a', 'Client E2E').should('exist');

    cy.contains('button', 'Déconnexion').click();
    cy.contains('a', 'Connexion').should('be.visible');
  });

  it('refuse un mauvais mot de passe', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('client@shop.com');
    cy.get('input[type="password"]').type('mauvais-mdp');
    cy.contains('button', 'Se connecter').click();

    cy.contains('Identifiants incorrects.').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('mot de passe oublié : affiche le lien de réinitialisation (mode dev)', () => {
    cy.visit('/forgot-password');
    cy.get('input[type="email"]').type('client@shop.com');
    cy.contains('button', 'Envoyer le lien').click();

    cy.contains('a', '/reset-password?token=').invoke('attr', 'href').then((href) => {
      cy.visit(href.replace(/^https?:\/\/[^/]+/, ''));
    });
    cy.get('input[type="email"]').should('have.value', 'client@shop.com');
  });

  it('protège les pages privées et l’admin', () => {
    cy.visit('/cart');
    cy.url().should('include', '/login');

    cy.loginAs('client@shop.com');
    cy.visit('/admin');
    cy.url().should('not.include', '/admin');
  });
});
