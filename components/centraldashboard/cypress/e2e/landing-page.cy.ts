describe('Landing Page', () => {
  beforeEach(()=>{
    cy.mockDashboardLinksRequest();
    cy.intercept('GET', `/api/workgroup/exists`, {
      "hasAuth":true,
      "user":"user.name@statcan.gc.ca",
      "email": "user.name@statcan.gc.ca",
      "hasWorkgroup":false,
      "registrationFlowAllowed":true
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
});