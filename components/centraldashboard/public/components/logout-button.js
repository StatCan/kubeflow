import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icons/iron-icons.js';

/**
 * Logout button component.
 * Handles the logout requests and post-logout redirects.
 *
 * ZONE: Sends a POST request to the oidc-authservice for logout.
 */

export class LogoutButton extends PolymerElement {
    static get template() {
        return html`
            <paper-icon-button 
                id="logout-button" 
                icon="kubeflow:logout" 
                on-tap="logout"
                title="{{localize('landingPage.btnLogout')}}"
            >
            </paper-icon-button>
            <iron-ajax
                    id='logout'
                    url$='{{logoutUrl}}'
                    method='post'
                    handle-as='json'
                    headers='{{headers}}'
                    on-response='_postLogout'>
            </iron-ajax>
        `;
    }

    static get properties() {
        return {
            headers: {
                type: Object,
                computed: '_setHeaders()',
            },
            logoutUrl: {
                type: String,
            },
        };
    }

    /**
     * After successful logout, redirects user to `afterLogoutURL`,
     * received from the backend.
     *
     * @param {{Event}} event
     * @private
     */
    _postLogout(event) {
        window.location.replace(event.detail.response['afterLogoutURL']);
    }

    /**
     * Call logout endpoint.
     */
    logout() {
        // call iron-ajax
        this.$.logout.generateRequest();
    }

    /**
     * Set 'Authorization' header based on the existing cookie.
     * Currently, the logout method only accepts authorization header, see:
     * https://github.com/arrikto/oidc-authservice/blob/master/server.go#L386
     *
     * @return {{Object}} headers
     * @private
     */
    _setHeaders() {
        const cookie = ('; ' + document.cookie)
            .split(`; authservice_session=`)
            .pop()
            .split(';')[0];
        return {
            'Authorization': `Bearer ${cookie}`,
        };
    }
}

customElements.define('logout-button', LogoutButton);
