// describe('Manage contributors page', () => {
//   beforeEach(()=>{
//     cy.mockWorkgroupRequest();
//     cy.mockDashboardLinksRequest();
//     cy.mockEnvInfoRequest();
//     cy.mockActivitiesRequest('test-namespace');
//     cy.mockGetNotebooksRequest('test-namespace');
//     cy.mockGetContributorsRequest('test-namespace');
    
//     cy.visit('/manage-users');

//     cy.wait(['@mockWorkgroupRequest', '@mockDashboardLinksRequest', '@mockEnvInfoRequest', '@mockActivitiesRequest', '@mockGetNotebooksRequest', '@mockGetContributorsRequest']);
//   });

  // 2.0 Deactivating the contributors page
  // it('should access the manage contributors page', ()=>{
  //   cy.get('main-page').shadow().find('manage-users-view').should('exist');
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('h1').should('have.text', 'Manage Contributors');
  //   // account info
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('#Main-Content > article.Acct-Info > h2 > span.text').should('have.text', 'Account info');
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('#Main-Content > article.Acct-Info > div.content').should('have.text', 'user.name@cloud.statcan.ca');
  //   // namespaces list
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('#Main-Content > article.Namespaces > h2').should('have.text', 'Namespace memberships');
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('#Main-Content > article.Namespaces > div > vaadin-grid').should('exist');
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('#Main-Content > article.Namespaces > div > vaadin-grid > vaadin-grid-cell-content:nth-child(11)').should('have.text', 'test-namespace');
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('#Main-Content > article.Namespaces > div > vaadin-grid > vaadin-grid-cell-content:nth-child(12)').should('have.text', 'Owner');
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('#Main-Content > article.Namespaces > div > vaadin-grid > vaadin-grid-cell-content:nth-child(13)').should('have.text', 'test-namespace-2');
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('#Main-Content > article.Namespaces > div > vaadin-grid > vaadin-grid-cell-content:nth-child(14)').should('have.text', 'Contributor');
  //   // manage contributors input
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('#Main-Content > article.Contributors > manage-users-view-contributor').should('exist');
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('manage-users-view-contributor').shadow().find('h2').should('have.text', 'Contributors to your namespace - test-namespace');
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('manage-users-view-contributor').shadow().find('md2-input > div.prefix > paper-chip').should('have.length', 2);
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('manage-users-view-contributor').shadow().find('md2-input > div.prefix > paper-chip').eq(0).should('have.text', 'user.name@cloud.ca');
  //   cy.get('main-page').shadow().find('manage-users-view').shadow().find('manage-users-view-contributor').shadow().find('md2-input > div.prefix > paper-chip').eq(1).should('have.text', 'first.last@domain.com');
  // });
// });