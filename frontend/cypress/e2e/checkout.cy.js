describe('Parcours client — login, panier, checkout', () => {
  it('permet de passer une commande', () => {
    cy.visit('/login');

    cy.get('input[type="email"]').type('client@shop.com');
    cy.get('input[type="password"]').type('password');
    cy.contains('button', 'Se connecter').click();

    cy.url().should('include', '/shop');
    cy.get('[aria-label="Ajouter au panier"]').first().click();

    cy.visit('/cart');
    cy.contains('a', 'Commander').click();

    cy.url().should('include', '/checkout');
    cy.get('textarea').type('123 Avenue Hassan II, Casablanca');
    cy.contains('button', 'Confirmer la commande').click();

    cy.url().should('include', '/orders');
  });
});
