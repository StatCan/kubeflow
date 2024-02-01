import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-progress/paper-progress.js';
import './iframe-link.js';
// eslint-disable-next-line max-len
import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';

import {html, PolymerElement} from '@polymer/polymer';

import './card-styles.js';

/**
 * Component to retrieve and display the default notebook
 */
// eslint-disable-next-line max-len
export class NotebookDefaultCard2 extends mixinBehaviors([AppLocalizeBehavior], PolymerElement) {
    static get template() {
        if (this.defaultNotebookExists) {
            return html`
            <style include="card-styles">
                :host {
                    @apply --layout-vertical;
                }
            </style>
            <iron-ajax auto url="[[defaultNotebookUrl]]" handle-as="json"
                loading="{{loading}}" on-response="_onNotebookServersResponse"
                on-error="_onError">
            </iron-ajax>
                <paper-card heading="Default Notebook">
                    <table>
                        <tr>
                            <td>Name</td>
                            <td>[[defaultNotebook.name]]</td>
                        </tr>
                        <tr>
                            <td>Type</td>
                            <td>[[defaultNotebook.shortImage]]</td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <button on-click="_connectNotebook">
                                    Connect
                                </button>
                            </td>
                        </tr>
                    </table>
            </paper-card>
            `;
        } else {
            return html`
            <style include="card-styles">
                :host {
                    @apply --layout-vertical;
                }
            </style>
            <iron-ajax auto url="[[createDefaultNotebookUrl]]" handle-as="json"
                method="POST" headers='{"Content-Type": "application/json"}'
                on-response="_onNotebookServersResponse"
                on-error="_onError">
            </iron-ajax>
                <paper-card heading="Default Notebook">
                    <p> 
                        The default notebook is one that will 
                        start automatically upon login into Kubeflow.

                        If you can see this note, the system has not detected
                        a default notebook. You may click on "Create" 
                        below to generate one. 
                    </p>
                    <button on-click="_createDefaultNotebook">
                        Create
                    </button>
            </paper-card>`;
        }
    }

    static get properties() {
        return {
            namespace: String,
            createDefaultNotebookUrl: {
                type: Object,
                computed: '_getCreateNotebookUrl(namespace)',
            },
            defaultNotebookUrl: {
                type: Object,
                computed: '_getNotebookUrl(namespace)',
            },
            defaultNotebook: {Object},
            defaultNotebookExists: Boolean,
        };
    }

    _getNotebookUrl(namespace) {
        if (!namespace) return null;
        return `/jupyter/api/namespaces/${namespace}/defaultnotebook`;
    }

    _getCreateNotebookUrl(namespace) {
        if (!namespace) return null;
        return `/jupyter/api/namespaces/${namespace}/createdefault`;
    }

    _connectNotebook() {
        // eslint-disable-next-line max-len
        window.open(`/notebook/${this.namespace}/${this.defaultNotebook.name}/`);
    }

    async _createDefaultNotebook() {
        // Disable the create button

        // Create the default notebook
        const APICreateDefault = this.$.CreateDefaultNotebook;

        await APICreateDefault.generateRequest().completes.catch((e) => e);
        await this.sleep(1); // So the errors and callbacks can schedule
        if (this.error && this.error.response) {
            if (this.error.response.error) {
                this.set('error', {response: {
                    error: 'registrationPage.errCreateNotebook',
                    namespace: this.namespace,
                }});
            }
        }
        // eslint-disable-next-line max-len
        return `/jupyter/api/namespaces/${this.defaultNotebook.name}/createdefault`;
    }

    /**
     * Handles the response to set the default notebook
     * @param {Event} responseEvent
     */
    async _onNotebookServersResponse(responseEvent) {
        const response = responseEvent.detail.response;
        this.loading = true;
        try {
            this.defaultNotebook = await response.notebook;
            this.defaultNotebookExists = this.defaultNotebook.name?
                true : false;
        } catch (err) {
            this._onError();
        }
        this.message = this.defaultNotebook.name ?
            '' : 'notebookCard.errNoNotebooks';
        this.loading = false;
    }

    /**
     * Handles an Notebooks error response.
     */
    _onError() {
        this.message = 'notebookCard.errRetrievingNotebooks';
    }

    // _pollUntilAnswer(namespace) {
    //     this.notebookObserver.subscribe
    // }

    // notebookObserver(): Observable<string | string[]> {
    //     return this.defaultNotebook$;
    //   }
}

customElements.define('notebook-default-card2', NotebookDefaultCard2);
