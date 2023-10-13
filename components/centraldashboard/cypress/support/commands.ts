/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('mockWorkgroupRequest', () => {
  cy.intercept('GET', `/api/workgroup/exists`, {
    fixture: 'workgroup',
  }).as('mockWorkgroupRequest');
});

Cypress.Commands.add('mockDashboardLinksRequest', () => {
  cy.intercept('GET', `/api/dashboard-links`, {
    fixture: 'dashboard-links',
  }).as('mockDashboardLinksRequest');
});

Cypress.Commands.add('mockEnvInfoRequest', () => {
  cy.intercept('GET', `/api/workgroup/env-info`, {
    fixture: 'env-info',
  }).as('mockEnvInfoRequest');
});

Cypress.Commands.add('mockActivitiesRequest', (namespace: string) => {
  cy.intercept('GET', `/api/activities/${namespace}`, {
    fixture: 'activities',
  }).as('mockActivitiesRequest');
});

Cypress.Commands.add('mockGetNotebooksRequest', (namespace: string) => {
  cy.intercept('GET', `/jupyter/api/namespaces/${namespace}/notebooks`, {
    fixture: 'notebooks',
  }).as('mockGetNotebooksRequest');
});

Cypress.Commands.add('mockGetContributorsRequest', (namespace: string) => {
  cy.intercept('GET', `/api/workgroup/get-contributors/${namespace}`, {
    fixture: 'contributors',
  }).as('mockGetContributorsRequest');
});

Cypress.Commands.add('mockNotebookContentsRequest', (namespace: string, notebook: string)=>{
  cy.intercept('GET', `/notebook/${namespace}/${notebook}/api/contents`, {
    fixture: 'contents',
  }).as('mockNotebookContentsRequest');
});