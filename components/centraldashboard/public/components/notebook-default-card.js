import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

import {html, PolymerElement} from '@polymer/polymer';

import './resources/paper-chip.js';
import './resources/md2-input/md2-input.js';
import css from './notebook-default-card.css';
import template from './notebook-default-card.pug';
// eslint-disable-next-line max-len
import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';

// eslint-disable-next-line max-len
export class NotebookDefaultCard
    extends mixinBehaviors([AppLocalizeBehavior], PolymerElement) {
    static get template() {
        return html([`
            <style>${css.toString()}</style>
            ${template()}
        `]);
    }

    /**
     * Object describing property-related metadata used by Polymer features
     */
    static get properties() {
        return {
            namespaces: String,
            notebookError: Object,
            namespace: String,
            defaultNotebook: {type: Object, value: undefined},
            loading: {type: Boolean, value: false},
            loaded: {
                type: Boolean,
                computed: '_forcePageLoad()',
            },
        };
    }

    // Functions to render the HTML correctly
    _isNotebookUndefined(t) {
        this.defaultNotebook = t;
        const x = this.defaultNotebook === undefined;
        return x;
    }

    isNotebookEmpty(t) {
        this.defaultNotebook = t;
        const y = this.defaultNotebook.name == '';
        return y;
    }

    isNotebookPvcExist(t) {
        this.defaultNotebook = t;
        return true;
    }

    isNotebookReady(t) {
        this.defaultNotebook = t;
        const z = this.defaultNotebook.status.phase == 'ready';
        return z;
    }

    /**
     * Main ready method for Polymer Elements.
     */
    ready() {
        super.ready();
        // this.contributorInputEl = this.$.ContribEmail;
    }

    _connectNotebook() {
        // eslint-disable-next-line max-len
        window.open(`/notebook/${this.namespace}/${this.defaultNotebook.name}/`);
    }

    _detailNotebook() {
        // Possibly need the language flag beforehand and or the jupyter
        // eslint-disable-next-line max-len
        window.open(`/notebook/details/${this.namespace}/${this.defaultNotebook.name}/`);
    }

    async _createDefaultNotebook() {
        // Disable the create button
        this.loading = true;
        // Create the default notebook
        const APICreateDefault = this.$.CreateDefaultNotebook;

        await APICreateDefault.generateRequest().completes.catch((e) => e);
        setInterval(() => { }, 1000);
        // So the errors and callbacks can schedule
        if (this.error && this.error.response) {
            if (this.error.response.error) {
                this.set('error', {response: {
                    error: 'registrationPage.errCreateNotebook',
                    namespace: this.namespace,
                }});
            }
        }
    }

    /**
     * Takes an event from iron-ajax and isolates the error from a request that
     * failed
     * @param {IronAjaxEvent} e
     * @return {string}
     */
    _isolateErrorFromIronRequest(e) {
        const bd = e.detail.request.response||{};
        return bd.error || e.detail.error || e.detail;
    }
    /**
     * Iron-Ajax response / error handler for addNewContributor
     * @param {IronAjaxEvent} e
     */
    handleNotebookCreate(e) {
        if (e.detail.error) {
            this.contribCreateError = e;
        }
        this.defaultNotebook = e.detail.response.notebook;
        this.contribCreateError = '';
        this.loading = false;
    }

    handlechFechtNotebook(e) {
        if (e.detail.error) {
            const error = this._isolateErrorFromIronRequest(e);
            alert(error);
        }
        this.defaultNotebook = e.detail.response.notebook;
    }

    /**
     * Iron-Ajax error handler for getContributors
     * @param {IronAjaxEvent} e
     */
    handleNotebookFetchError(e) {
        const error = this._isolateErrorFromIronRequest(e);
        this.notebookError = error;
        alert(error);
    }

    /**
     * Iron-Ajax error handler for getContributors
     * @param {IronAjaxEvent} e
     */
    handleNotebookCreateError(e) {
        const error = this._isolateErrorFromIronRequest(e);
        this.notebookError = error;
        alert(error);
    }

    _forcePageLoad() {
        setInterval(() => {
            this._reload();
        }, 5000);
    }

    _reload() {
        // eslint-disable-next-line max-len
        const container = document.querySelector('main-page').shadowRoot.querySelector('main neon-animated-pages neon-animatable dashboard-view').shadowRoot.querySelector('#DefaultNotebookCard');
        const content = container.innerHTML;
        container.innerHTML= content;
        // this line is to watch the result in console , you can remove it later
        // eslint-disable-next-line no-console
        console.log('Refreshed');
    }
}
/* eslint-disable max-len */
customElements.define('notebook-default-card', NotebookDefaultCard
);
