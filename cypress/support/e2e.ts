// Cypress E2E setup
beforeEach(() => {
  // Reset all state before each test
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Custom command for login (if needed)
Cypress.Commands.add("login", () => {
  cy.visit("/");
});

// Accessibility check
Cypress.Commands.add("checkA11y", () => {
  cy.injectAxe();
  cy.checkA11y();
});
