describe('Landing Page', () => {
  beforeEach(()=>{
    cy.mockDashboardLinksRequest();
    cy.intercept('GET', `/api/workgroup/exists`, {
      "hasAuth":true,
      "user":"user.name@statcan.gc.ca",
      "email": "user.name@statcan.gc.ca",
      "hasWorkgroup":false,
      "registrationFlowAllowed": true,
      "isAllowed": true
    }).as('mockWorkgroupRequest');

    cy.visit('/');

    cy.wait(['@mockWorkgroupRequest', '@mockDashboardLinksRequest']);
  });

  it('should access the landing page', ()=>{
    cy.get('main-page').shadow().find('landing-page').should('exist');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > h2').should('have.text', 'Welcome');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > aside').find('a').should('exist').and('have.prop', 'href', 'https://zone.pages.cloud.statcan.ca/docs/en/');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable').find('md2-input#Email').should('exist').and('have.prop', 'value', 'user.name@statcan.gc.ca');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable').find('md2-input#Namespace').should('exist').and('have.prop', 'value', 'user-name');
  });

  // If the email is cloud statcan (or any not statcan.gc.ca) expect to see error with logout
  it('should show wrong email page', ()=>{
    cy.intercept('GET', `/api/workgroup/exists`, {
      "hasAuth":true,
      "user":"user.name@cloud.statcan.gc.ca",
      "email": "user.name@cloud.statcan.gc.ca",
      "hasWorkgroup":false,
      "registrationFlowAllowed":true
    }).as('mockWorkgroupRequest');
    cy.visit('/');

    cy.wait(['@mockWorkgroupRequest', '@mockDashboardLinksRequest']);

    cy.get('main-page').shadow().find('landing-page').should('exist');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > h2').should('have.text', 'Welcome');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > p').should('have.text', 'You are currently logged in using user.name@cloud.statcan.gc.ca, this domain is not supported. Please log out and log in using your “@statcan.gc.ca” email.');
    cy.get('main-page').shadow().find('landing-page').shadow().find('#MainCard > neon-animatable > paper-button').should('have.text', 'Logout');
  });
});