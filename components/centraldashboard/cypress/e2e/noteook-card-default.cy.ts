describe('Notebook Default Card', () => {

  //Should have the Create card
  it('should have a notebook card', () => {
    cy.mockWorkgroupRequest();
    cy.mockDashboardLinksRequest();
    cy.mockEnvInfoRequest();
    cy.mockActivitiesRequest('test-namespace');
    cy.mockGetNotebooksRequest('test-namespace');
    cy.mockGetContributorsRequest('test-namespace');
    cy.mockDefaultNotebook('test-namespace');
    
    cy.visit('/');

    cy.wait([
      '@mockWorkgroupRequest', 
      '@mockDashboardLinksRequest', 
      '@mockEnvInfoRequest', 
      '@mockActivitiesRequest', 
      '@mockGetNotebooksRequest', 
      '@mockGetContributorsRequest',
      '@mockDefaultNotebook'
    ]);
    cy.get('main-page').should('exist');
    cy.get('main-page').shadow().find('dashboard-view').should('exist');
    // create new notebook link
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('notebook-default-card').should('exist');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('notebook-default-card').should('exist').shadow().find('paper-card#DefaultNotebookCard').should('exist');
    // test if the two buttons are there and valid
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('notebook-default-card').should('exist').shadow().find('paper-card#DefaultNotebookCard > .data-content > .button-div > paper-button#Details').should('exist');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('notebook-default-card').should('exist').shadow().find('paper-card#DefaultNotebookCard > .data-content > .button-div > paper-button#GoTo').should('exist');
  })

  // Message + button if no default
  it('should propose default notebook creation', () => {
    cy.mockWorkgroupRequest();
    cy.mockDashboardLinksRequest();
    cy.mockEnvInfoRequest();
    cy.mockActivitiesRequest('test-namespace');
    cy.mockGetNotebooksRequest('test-namespace');
    cy.mockGetContributorsRequest('test-namespace');
    cy.intercept('GET', `/jupyter/api/namespaces/test-namespace/defaultnotebook`, {
      "success": false,
      "status": 404,
      "log": "No default notebook found",
      "user": "wendy.gaultier@statcan.gc.ca"
  }).as('mockDefaultNotebook');
    
    cy.visit('/');

    cy.wait([
      '@mockWorkgroupRequest', 
      '@mockDashboardLinksRequest', 
      '@mockEnvInfoRequest', 
      '@mockActivitiesRequest', 
      '@mockGetNotebooksRequest', 
      '@mockGetContributorsRequest',
      '@mockDefaultNotebook'
    ]);

    cy.get('main-page').shadow().find('dashboard-view').shadow().find('notebook-default-card').should('exist').shadow().find('paper-card#DefaultNotebookCard > .data-content > .button-div > paper-button#Create').should('exist');
  })
})