describe('Landing Page', () => {
  beforeEach(()=>{
    cy.mockDashboardLinksRequest();
    cy.intercept('GET', `/api/workgroup/exists`, {
      "hasAuth":true,
      "user":"user.name@statcan.gc.ca",
      "email":"user.name@statcan.gc.ca",
      "hasWorkgroup":false,
      "registrationFlowAllowed": true,
      "isAllowed": true
    }).as('mockWorkgroupRequest');

    cy.visit('/');

    cy.wait(['@mockWorkgroupRequest', '@mockDashboardLinksRequest']);
  });

  it('should access the landing page', ()=>{
    cy.get('main-page').shadow().find('blocked-user-view').should('not.be.visible');
    cy.get('main-page').shadow().find('landing-page').should('exist');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > h2').should('have.text', 'Welcome');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > p').find('a').should('exist').and('have.prop', 'href', 'https://zone.pages.cloud.statcan.ca/docs/en/');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > div > #emailDisplay').find('span').should('exist').and('have.text', 'user.name@statcan.gc.ca');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > div > #namespaceDisplay').find('span').should('exist').and('have.text', 'user-name');
  });
  it('Email number should stay in namespace', ()=>{
    cy.intercept('GET', `/api/workgroup/exists`, {
      "hasAuth":true,
      "user":"user.name1@statcan.gc.ca",
      "email": "user.name1@statcan.gc.ca",
      "hasWorkgroup":false,
      "registrationFlowAllowed": true,
      "isAllowed": true
    }).as('mockWorkgroupRequest');
    cy.visit('/');

    cy.wait(['@mockWorkgroupRequest', '@mockDashboardLinksRequest']);
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > div > #emailDisplay').find('span').should('exist').and('have.text', 'user.name1@statcan.gc.ca');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > div > #namespaceDisplay').find('span').should('exist').and('have.text', 'user-name1');
  });

  it('should create new namespace and notebook', ()=>{
    //Not asserting landing page username and namespace values since it's asserted in the test above
    cy.get('main-page').shadow().find('landing-page').shadow().find('#Next').should('exist');

    //mocks the calls
    cy.intercept('POST', '/api/workgroup/create', {
      message: `Created namespace user-name`
    }).as('mockNamespaceCreateRequest');
    cy.mockCreateDefaultNotebook('user-name');
    cy.mockDefaultNotebook('user-name');
    cy.mockWorkgroupRequest();
    cy.intercept('GET', '/api/workgroup/env-info', {
      "user": "user.name@cloud.statcan.ca",
      "platform": {
        "kubeflowVersion": "v1beta1",
        "provider": "test_provider",
        "providerName": "azure",
        "logoutUrl": "/logout"
      },
      "namespaces": [
        {
          "user": "user.name@statcan.gc.ca",
          "namespace": "user-name",
          "role": "owner"
        }
      ],
      "isClusterAdmin": false
    }).as("mockEnvInfo");


    cy.get('main-page').shadow().find('landing-page').shadow().find('#Next').click();
    cy.wait(['@mockEnvInfo', '@mockNamespaceCreateRequest', '@mockCreateDefaultNotebook', '@mockDefaultNotebook', '@mockWorkgroupRequest']);

    //assert the main page and that the default notebook shows up
    cy.get('main-page').shadow().find('landing-page').should('not.be.visible');
    cy.get('main-page').shadow().find('blocked-user-view').should('not.be.visible');
    cy.get('main-page').shadow().find('dashboard-view').should('exist');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('notebook-default-card').shadow().find('paper-card#DefaultNotebookCard').should('exist');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('notebook-default-card').shadow().find('paper-card#DefaultNotebookCard > .data-content > .button-div > paper-button#Details').should('exist');
  });

  it('should fail the namespace creation', ()=>{
    cy.intercept('POST', '/api/workgroup/create', {
      statusCode: 400,
      body: {
        error: "Error message"
      }
    }).as('mockNamespaceCreateRequest');

    cy.get('main-page').shadow().find('landing-page').shadow().find('#Next').click();
    cy.wait('@mockNamespaceCreateRequest')

    //assert that the error happened
    cy.get('main-page').shadow().find('landing-page').shadow().find('#ErrorLandingPageToast').should('exist').and('have.text', 'An error occured while creating the workspace');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#Next').should('be.visible');
  });

  it('should fail the default notebook after create namespace', ()=>{
    cy.intercept('POST', '/api/workgroup/create', {
      message: `Created namespace user-name`
    }).as('mockNamespaceCreateRequest');
    cy.intercept('POST', '/jupyter/api/namespaces/user-name/createdefault', {
      statusCode: 400,
      body: {
        error: "error creating default notebook"
      }
    }).as('mockCreateDefaultNotebook');
    cy.mockWorkgroupRequest();
    cy.intercept('GET', '/api/workgroup/env-info', {
      "user": "user.name@cloud.statcan.ca",
      "platform": {
        "kubeflowVersion": "v1beta1",
        "provider": "test_provider",
        "providerName": "azure",
        "logoutUrl": "/logout"
      },
      "namespaces": [
        {
          "user": "user.name@statcan.gc.ca",
          "namespace": "user-name",
          "role": "owner"
        }
      ],
      "isClusterAdmin": false
    }).as("mockEnvInfo");

    cy.get('main-page').shadow().find('landing-page').shadow().find('#Next').click();
    cy.wait(['@mockNamespaceCreateRequest', '@mockCreateDefaultNotebook', '@mockWorkgroupRequest', '@mockEnvInfo']);

    //assert that there is no default notebook
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('notebook-default-card').should('exist').shadow().find('paper-card#DefaultNotebookCard > .data-content > .button-div > paper-button#Create').should('exist');
  });

  // If the email is cloud statcan (or any not statcan.gc.ca) expect to see error with logout
  it('should show wrong email page', ()=>{
    cy.intercept('GET', '/api/workgroup/exists', {
      "hasAuth":true,
      "user":"user.name@cloud.statcan.gc.ca",
      "email": "user.name@cloud.statcan.gc.ca",
      "hasWorkgroup":false,
      "registrationFlowAllowed": true,
      "isAllowed": true
    }).as('mockWorkgroupRequest');
    cy.visit('/');

    cy.wait(['@mockWorkgroupRequest', '@mockDashboardLinksRequest']);

    cy.get('main-page').shadow().find('blocked-user-view').should('not.be.visible');
    cy.get('main-page').shadow().find('landing-page').should('exist');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > h2').should('have.text', 'Welcome');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > p').should('have.text', 'You are currently logged in using user.name@cloud.statcan.gc.ca, this domain is not supported. Please log out and log in using your “@statcan.gc.ca” email.');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > paper-button').should('have.text', 'Logout');
  });
});