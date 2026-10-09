describe('Parcours d’achat client', () => {
  beforeEach(() => {
    cy.loginAs('client@shop.com');
  });

  it('recherche, fiche produit, avis', () => {
    cy.visit('/shop?search=Casque');
    cy.contains('h1', 'Résultats').should('be.visible');
    cy.contains('h3', 'Casque Bluetooth').click();

    cy.url().should('match', /\/products\/\d+$/);
    cy.contains('h1', 'Casque Bluetooth').should('be.visible');

    const comment = `Avis E2E ${Date.now()}`;
    cy.get('textarea[placeholder="Votre avis..."]').type(comment);
    cy.contains('button', 'Publier l').click();
    cy.contains(comment).should('be.visible');
  });

  it('favoris : ajouter puis retirer', () => {
    cy.visit('/shop');
    cy.get('[aria-label="Ajouter aux favoris"]').first().click();

    cy.visit('/wishlist');
    cy.contains('produit(s) sauvegardé(s)').should('be.visible');
    cy.get('article').its('length').then((before) => {
      cy.get('[aria-label="Ajouter aux favoris"]').first().click();
      cy.get('article').should('have.length.lessThan', before);
    });
  });

  it('panier : modifier la quantité et supprimer', () => {
    cy.visit('/shop');
    cy.get('[aria-label="Ajouter au panier"]').first().click();

    cy.visit('/cart');
    cy.get('input[type="number"]').first().clear().type('2');
    cy.contains('Total :').should('be.visible');
    cy.get('input[type="number"]').its('length').then((n) => {
      cy.contains('button', '✕').first().click();
      if (n === 1) cy.contains('Votre panier est vide.').should('be.visible');
      else cy.get('input[type="number"]').should('have.length', n - 1);
    });
  });

  it('commande refusée avec un coupon expiré', () => {
    cy.visit('/shop');
    cy.get('[aria-label="Ajouter au panier"]').first().click();

    cy.visit('/checkout');
    cy.get('textarea').type('12 rue E2E, Rabat');
    cy.get('input[placeholder="WELCOME10"]').type('WELCOME10');
    cy.contains('button', 'Confirmer la commande').click();

    cy.contains('Ce code promo a expiré.').should('be.visible');
    cy.url().should('include', '/checkout');
  });
});
