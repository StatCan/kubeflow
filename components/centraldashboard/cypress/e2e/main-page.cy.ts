describe('Main Page', () => {
  beforeEach(()=>{
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
  });

  it('should access the dashboard', () => {
    cy.get('main-page').should('exist');
    cy.get('main-page').shadow().find('dashboard-view').should('exist');
    // create new notebook link
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Quick-Links').should('exist');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Quick-Links').find('iframe-link').should('exist').and('have.length', 1).and('have.prop', 'href', '/en/new?ns=test-namespace');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Quick-Links').find('iframe-link').find('div.header').should('have.text', 'Create a new Notebook server');
    // documentation links
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').should('exist');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').should('have.length', 4);
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(0).should('have.prop', 'href', 'https://statcan.github.io/aaw/');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(0).find('div.header').should('have.text', 'Advanced Analytics Workspace Docs');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(0).find('aside').should('have.text', 'Helpful guides about our data and analysis tools');

    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(1).should('have.prop', 'href', 'https://www.youtube.com/playlist?list=PL1zlA2D7AHugkDdiyeUHWOKGKUd3MB_nD');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(1).find('div.header').should('have.text', 'Video Tutorial Series');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(1).find('aside').should('have.text', 'YouTube playlist of videos for getting started with Advanced Analytics Workspace tools');

    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(2).should('have.prop', 'href', 'https://statcan-aaw.slack.com/');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(2).find('div.header').should('have.text', 'Community Chat');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(2).find('aside').should('have.text', 'Slack workspace for discussion/support - requires sign-up for emails outside @canada.ca');

    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(3).should('have.prop', 'href', 'https://www.kubeflow.org/docs/');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(3).find('div.header').should('have.text', 'Official Kubeflow Docs');
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('paper-card#Documentation').find('a').eq(3).find('aside').should('have.text', 'Advanced documentation for installing, running, and using Kubeflow');
    //activities tab
    cy.get('main-page').shadow().find('#ViewTabs > paper-tabs > paper-tab:nth-child(2)').click();
    cy.url().should('eq', 'http://localhost:8080/activity?ns=test-namespace');
    cy.get('main-page').shadow().find('activity-view').should('exist');
    cy.get('main-page').shadow().find('activity-view').shadow().find('activities-list').shadow().find('div.activity-row').should('have.length', 3);
  });

  it('should have working menu links', () => {
    cy.get('main-page').shadow().find('app-drawer').should('have.prop', 'opened', false);

    cy.get('main-page').shadow().find('#Menu').click();
    cy.get('main-page').shadow().find('app-drawer').should('have.prop', 'opened', true);

    cy.get('main-page').shadow().find('[data-cy-menu-links]').should('exist');
    cy.get('main-page').shadow().find('a[href="/?ns=test-namespace"]').should('exist');
    cy.get('main-page').shadow().find('a[href="/?ns=test-namespace"]').find('paper-item').should('have.text', 'Home');

    cy.get('main-page').shadow().find('iframe-link[href="/en/?ns=test-namespace"]').should('exist');
    cy.get('main-page').shadow().find('iframe-link[href="/en/?ns=test-namespace"]').find('paper-item').should('have.text', 'Notebooks');

    cy.get('main-page').shadow().find('a[href="https://zone.pages.cloud.statcan.ca/docs/en/"]').should('exist');
    cy.get('main-page').shadow().find('a[href="https://zone.pages.cloud.statcan.ca/docs/en/"]').find('paper-item').should('have.text', 'Documentation');
  
    //mock env info to hide manage contributors link
    cy.intercept('GET', `/api/workgroup/env-info`, {
      "platform": {
        "kubeflowVersion": "v1beta1",
        "provider": "test_provider",
        "providerName": "azure",
        "logoutUrl": "/logout"
      },
      "namespaces": [
        {
          "user": "user.name@cloud.statcan.ca",
          "namespace": "test-namespace-2",
          "role": "contributor"
        },
        {
          "user": "user.name@cloud.statcan.ca",
          "namespace": "test-namespace",
          "role": "contributor"
        }
      ],
      "isClusterAdmin": false
    }).as('mockEnvInfoRequest');

    cy.visit('/');

    cy.wait([
      '@mockWorkgroupRequest', 
      '@mockDashboardLinksRequest', 
      '@mockEnvInfoRequest'
    ]);

    cy.get('main-page').shadow().find('#Menu').click();
    cy.get('main-page').shadow().find('a[href="/manage-users?ns=test-namespace-2"]').should('not.exist');
  });

  it('should change namespace', () => {
    cy.mockActivitiesRequest('test-namespace-2');
    cy.intercept('GET', `/jupyter/api/namespaces/test-namespace-2/notebooks`, {
      "success": true,
      "status": 200,
      "notebooks": [
        {
          "age": "2022-09-01T15:15:35Z",
          "cpu": "1m",
          "gpus": {
            "count": 0,
            "message": ""
          },
          "image": "kubeflownotebookswg/jupyter-scipy:latest",
          "lastActivity": "2022-09-21T12:15:06Z",
          "memory": "1073741824m",
          "name": "test-notebook-for-testing",
          "namespace": "test-namespace-2",
          "serverType": "jupyter",
          "shortImage": "jupyter-scipy:latest",
          "status": {
            "message": "Warning",
            "phase": "warning",
            "state": ""
          },
          "volumes": [
            "dshm",
            "dog-breed-nwmrc-tutorial-dog-breed-datavol-1-xrrmt-lf276",
            "dog-breed-nwmrc-tutorial-dog-breed-workspace-24ntl-jcjlv"
          ]
        }
      ]
    }).as('mockGetNotebooksRequest2');
    cy.intercept('GET', `/jupyter/api/namespaces/test-namespace-2/defaultnotebook`, {
      statusCode: 500,
    }).as('mockDefaultNotebook2');
    cy.get('main-page').shadow().find('#NamespaceSelector').click({force: true});
    cy.get('main-page').shadow().find('#NamespaceSelector').shadow().find('paper-menu-button > paper-listbox > paper-item:nth-child(2)').click({force: true});
    cy.wait([
      '@mockActivitiesRequest',
      '@mockGetNotebooksRequest2',
      '@mockDefaultNotebook2'
    ]);

    cy.url().should('eq', 'http://localhost:8080/?ns=test-namespace-2');

    // test links with new namespace
    cy.get('main-page').shadow().find('app-drawer').should('have.prop', 'opened', false);

    cy.get('main-page').shadow().find('#Menu').click();
    cy.get('main-page').shadow().find('app-drawer').should('have.prop', 'opened', true);

    cy.get('main-page').shadow().find('[data-cy-menu-links]').should('exist');
    cy.get('main-page').shadow().find('a[href="/?ns=test-namespace-2"]').should('exist');
    cy.get('main-page').shadow().find('a[href="/?ns=test-namespace-2"]').find('paper-item').should('have.text', 'Home');

    cy.get('main-page').shadow().find('iframe-link[href="/en/?ns=test-namespace-2"]').should('exist');
    cy.get('main-page').shadow().find('iframe-link[href="/en/?ns=test-namespace-2"]').find('paper-item').should('have.text', 'Notebooks');

    cy.get('main-page').shadow().find('a[href="https://zone.pages.cloud.statcan.ca/docs/en/"]').should('exist');
    cy.get('main-page').shadow().find('a[href="https://zone.pages.cloud.statcan.ca/docs/en/"]').find('paper-item').should('have.text', 'Documentation');
  });

  //Should have the Create card
  it('should have a notebook card', () => {
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
    cy.intercept('GET', `/jupyter/api/namespaces/test-namespace-1/defaultnotebook`, {notebook: {}}).as('mockDefaultNotebook');
    cy.visit('/');
    cy.wait([
      '@mockDefaultNotebook',
    ]);
    cy.get('main-page').shadow().find('dashboard-view').shadow().find('notebook-default-card').should('exist').shadow().find('paper-card#DefaultNotebookCard > .data-content > .button-div > paper-button#Create').should('exist');
  })
})