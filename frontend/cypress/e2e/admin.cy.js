describe('Back-office admin', () => {
  beforeEach(() => {
    cy.loginAs('admin@shop.com');
  });

  it('dashboard : compteurs et graphiques', () => {
    cy.visit('/admin');
    cy.contains('h1', 'Dashboard').should('be.visible');
    cy.contains('Produits').should('be.visible');
    cy.contains("Chiffre d'affaires").should('be.visible');
    cy.get('canvas').should('have.length.at.least', 1);
  });

  it('catégories : créer, modifier, supprimer', () => {
    const name = `Cat E2E ${Date.now()}`;
    cy.visit('/admin/categories');
    cy.contains('button', 'Nouvelle catégorie').click();
    cy.get('input[placeholder="Nom"]').type(name);
    cy.contains('button', 'Enregistrer').click();
    cy.contains('h3', name).should('be.visible');

    cy.contains('h3', name).parent().contains('button', 'Modifier').click();
    cy.get('input[placeholder="Nom"]').clear().type(`${name} bis`);
    cy.contains('button', 'Enregistrer').click();
    cy.contains('h3', `${name} bis`).should('be.visible');

    cy.contains('h3', `${name} bis`).parent().contains('button', 'Supprimer').click();
    cy.contains('h3', `${name} bis`).should('not.exist');
  });

  it('produits : créer puis supprimer un produit jamais commandé', () => {
    const name = `Produit E2E ${Date.now()}`;
    cy.visit('/admin/products');
    cy.contains('button', 'Nouveau produit').click();
    cy.get('input[placeholder="Nom"]').type(name);
    cy.get('input[placeholder="Prix (DH)"]').type('99');
    cy.get('input[placeholder="Stock"]').clear().type('3');
    cy.contains('button', 'Créer').click();
    cy.contains('td', name).should('be.visible');

    cy.contains('td', name).parent().contains('button', 'Suppr.').click();
    cy.contains('td', name).should('not.exist');
  });

  it('coupons : créer avec limite et minimum', () => {
    const code = `ADM${Date.now()}`;
    cy.visit('/admin/coupons');
    cy.contains('button', 'Nouveau coupon').click();
    cy.get('input[placeholder^="Code"]').type(code);
    cy.get('select').select('fixed');
    cy.get('input[placeholder="Réduction en DH"]').type('20');
    cy.get('input[placeholder^="Limite"]').type('5');
    cy.get('input[placeholder^="Montant minimum"]').type('200');
    cy.contains('button', 'Créer').click();

    cy.contains(code).parent().parent().within(() => {
      cy.contains('Utilisations : 0 / 5').should('be.visible');
      cy.contains('Minimum : 200.00 DH').should('be.visible');
    });
  });

  it('commandes : changer le statut', () => {
    cy.visit('/admin/orders');
    cy.contains('Commande #').should('be.visible');
    cy.get('select').first().select('processing');
    cy.contains('Statut de la commande mis à jour.').should('be.visible');
  });

  it('utilisateurs : liste avec bouton d’activation pour les clients', () => {
    cy.visit('/admin/users');
    cy.contains('td', 'client@shop.com').parent().contains('button', /Désactiver|Activer/).should('be.visible');
  });
});
