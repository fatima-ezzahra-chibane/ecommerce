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

  it('applique un coupon valide créé par l’admin', () => {
    const code = `E2E${Date.now()}`;
    cy.apiAs('admin@shop.com', 'POST', '/admin/coupons', {
      code, discount: 10, type: 'percent', usage_limit: 1,
    }).its('status').should('eq', 201);

    cy.loginAs('client@shop.com');
    cy.visit('/shop');
    cy.get('[aria-label="Ajouter au panier"]').first().click();

    cy.visit('/checkout');
    cy.get('textarea').type('12 rue Coupon, Rabat');
    cy.get('input[placeholder="WELCOME10"]').type(code);
    cy.contains('button', 'Confirmer la commande').click();

    cy.url().should('include', '/orders');
    cy.contains(`Coupon : ${code}`).should('be.visible');

    // usage_limit = 1 : une seconde utilisation est refusée
    cy.visit('/shop');
    cy.get('[aria-label="Ajouter au panier"]').first().click();
    cy.visit('/checkout');
    cy.get('textarea').type('12 rue Coupon, Rabat');
    cy.get('input[placeholder="WELCOME10"]').type(code);
    cy.contains('button', 'Confirmer la commande').click();
    cy.contains("Ce code promo a atteint sa limite d'utilisation.").should('be.visible');
  });
});
