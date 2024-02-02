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
        return html`
            <style include="card-styles">
                :host {
                    @apply --layout-vertical;
                }
            </style>
            <iron-ajax
                id='gDef'
                auto
                url$='{{defaultNotebookUrl}}'
                method='get'
                handle-as='json'
                headers='{"Content-Type": "application/json"}'
                on-response='_onNotebookServersResponse'>
            </iron-ajax>
            <paper-card id="refreshingDetail" heading="Default Notebook">
                <template is="dom-if" if="[[isNotebookUndefined()]]">
                    <p> Data not here yet</p>
                </template>
                <template is="dom-if" if="[[!isNotebookUndefined()]]">
                    <template is="dom-if" if="[[isNotebookCreated()]]">
                        <p> Data came back, no default notebook  </p>
                    </template>
                    <template is="dom-if" if="[[!isNotebookCreated()]]">
                        <template is="dom-if" if="!isNotebookReady()]]">
                            <p> Data came back, NDefault notebook exists, 
                            not ready</p>
                        </template>
                        <template is="dom-if" if="[[isNotebookReady()]]">
                            <p> Data came back, 
                            Default notebook exists, Ready</p>
                        </template>
                    </template>
                </template>
                <template is="dom-if" if="[[isLoading()]]">
                    <p> Loaded?</p>
                </template>
            </paper-card>
        `;
    }
    test() {
        // eslint-disable-next-line max-len
        const container = document.querySelector('main-page').shadowRoot.querySelector('main neon-animated-pages neon-animatable dashboard-view').shadowRoot.querySelector('notebook-default-card2').shadowRoot.querySelector('paper-card');
        // eslint-disable-next-line max-len
        const x = html`
    <paper-card id="refreshingDetail" heading="Default Notebook">
        <template is="dom-if" if="[[isNotebookUndefined()]]">
            <p> Data not here yet</p>
        </template>
        <template is="dom-if" if="[[!isNotebookUndefined()]]">
            <template is="dom-if" if="[[isNotebookCreated()]]">
                <p> Data came back, no default notebook  </p>
            </template>
            <template is="dom-if" if="[[!isNotebookCreated()]]">
                <template is="dom-if" if="!isNotebookReady()]]">
                    <p> Data came back, NDefault notebook exists, 
                    not ready</p>
                </template>
                <template is="dom-if" if="[[isNotebookReady()]]">
                    <p> Data came back, 
                    Default notebook exists, Ready</p>
                </template>
            </template>
        </template>
        <template is="dom-if" if="[[isLoading()]]">
            <p> Loaded?</p>
        </template>
    </paper-card>`;
        container.parentNode.replaceChild(x.content, container);

        // eslint-disable-next-line no-console
        console.log('Refreshed');
    }

    _postLogout(event) {
        alert('Hi');
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
            loading: Boolean,
            loaded: {
                type: Boolean,
                computed: '_forcePageLoad()',
            },
        };
    }


    // Functions to render the HTML correctly
    isNotebookUndefined() {
        const x = this.defaultNotebook === undefined;
        return x;
    }

    isNotebookCreated() {
        const y = this.defaultNotebook.name != '';
        return y;
    }

    isNotebookReady() {
        const z = this.defaultNotebook.status == 'ready';
        return z;
    }

    isLoading() {
        return this.loading;
    }

    _getNotebookUrl(namespace) {
        if (!namespace) return null;
        return `/jupyter/api/namespaces/${namespace}/defaultnotebook`;
    }

    _getCreateNotebookUrl(namespace) {
        if (!namespace) return null;
        return `/jupyter/api/namespaces/${namespace}/createdefault`;
    }

    _forcePageLoad() {
        window.addEventListener('load', function() {
            alert('It\'s loaded!');
            // eslint-disable-next-line max-len
            const container = document.querySelector('main-page').shadowRoot.querySelector('main neon-animated-pages neon-animatable dashboard-view').shadowRoot.querySelector('notebook-default-card2').shadowRoot.querySelector('#refreshingDetail');
            const content = container.innerHTML;
            container.innerHTML= content;

            // eslint-disable-next-line no-console
            console.log('Refreshed');
        });
        // document.addEventListener('load', this.test());
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
            this.test();
        } catch (err) {
            this._onError();
        }
        this.loading = false;
    }

    /**
     * Handles an Notebooks error response.
     */
    _onError() {
        this.message = 'notebookCard.errRetrievingNotebooks';
        alert(this.message);
    }

    // _pollUntilAnswer(namespace) {
    //     this.notebookObserver.subscribe
    // }

    // notebookObserver(): Observable<string | string[]> {
    //     return this.defaultNotebook$;
    //   }
}

customElements.define('notebook-default-card2', NotebookDefaultCard2);
