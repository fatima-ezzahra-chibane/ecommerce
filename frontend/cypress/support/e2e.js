// Support Cypress E2E

const API = Cypress.env('API_URL') || 'http://localhost:8080/api/v1';

// Connexion via l'API (cache de session : évite la limite de 10 logins/minute)
Cypress.Commands.add('loginAs', (email, password = 'password') => {
  cy.session([email, password], () => {
    cy.request('POST', `${API}/login`, { email, password }).then(({ body }) => {
      window.localStorage.setItem('token', body.token);
    });
  });
});

Cypress.Commands.add('apiAs', (email, method, path, body) => {
  return cy.request('POST', `${API}/login`, { email, password: 'password' }).then(({ body: auth }) =>
    cy.request({
      method,
      url: `${API}${path}`,
      body,
      headers: { Authorization: `Bearer ${auth.token}`, Accept: 'application/json' },
      failOnStatusCode: false,
    })
  );
});
