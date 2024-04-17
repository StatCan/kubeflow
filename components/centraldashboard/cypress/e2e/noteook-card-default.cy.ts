describe('Notebook Default Card', () => {
  beforeEach(()=>{
    cy.mockWorkgroupRequest();
    cy.mockDashboardLinksRequest();
    cy.mockEnvInfoRequest();
    cy.mockActivitiesRequest('test-namespace');
    cy.mockGetNotebooksRequest('test-namespace');
    cy.mockGetContributorsRequest('test-namespace');
    cy.visit('/');

    cy.wait([
      '@mockWorkgroupRequest', 
      '@mockDashboardLinksRequest', 
      '@mockEnvInfoRequest', 
      '@mockActivitiesRequest', 
      '@mockGetNotebooksRequest', 
      '@mockGetContributorsRequest',
    ]);
  });
  //Should have the Create card
  it('should have a notebook card', () => {
    cy.mockDefaultNotebook('test-namespace');
    
    cy.visit('/');

    cy.wait([
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
    cy.intercept('GET', `/jupyter/api/namespaces/test-namespace/defaultnotebook`, {}).as('mockDefaultNotebook');
    
    cy.visit('/');

    cy.wait([
      '@mockDefaultNotebook'
    ]);

    cy.get('main-page').shadow().find('dashboard-view').shadow().find('notebook-default-card').should('exist').shadow().find('paper-card#DefaultNotebookCard > .data-content > .button-div > paper-button#Create').should('exist');
  })
})