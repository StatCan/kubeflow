import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

import {html, PolymerElement} from '@polymer/polymer';

import './card-styles.js';
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
            defaultNotebookError: Object,
            namespace: String,
            loading: {type: Boolean, value: false},
            error: Object,
        };
    }

    // Functions to render the HTML correctly
    _isNotebookUndefined(t) {
        return t.notebook === undefined;
    }

    _isNotebookEmpty(t) {
        return t.notebook.name == '';
    }

    _isNotebookReady(t) {
        return t.notebook.status.phase == 'ready';
    }

    _connectNotebook() {
        // eslint-disable-next-line max-len
        window.open(`/notebook/${this.namespace}/${this.defaultNotebook.notebook.name}/`);
    }

    _detailNotebook() {
        // Possibly need the language flag beforehand and or the jupyter
        // eslint-disable-next-line max-len
        window.open(`/notebook/details/${this.namespace}/${this.defaultNotebook.notebook.name}/`);
    }

    /**
     * Main ready method for Polymer Elements.
     */
    ready() {
        super.ready();
    }

    async _createDefaultNotebook() {
        // Disable the create button
        this.loading = true;
        // Create the default notebook
        const APICreateDefault = this.$.CreateDefaultNotebook;

        await APICreateDefault.generateRequest().completes.catch((e) => {
            this.error = e;
        });

        setInterval(() => { }, 1000);
        // So the errors and callbacks can schedule
        if (this.error && this.error.response) {
            if (!this.error) {
                // Temp fix for refreshing data
                // window.location.reload();
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
            this.defaultNotebookError = e;
            this.$.DefaultNotebookError.show();
        } else {
            this.defaultNotebook = e.detail.response.notebook;
            this.defaultNotebookError = '';
        }
        this.loading = false;
    }

    /**
     * Iron-Ajax error handler for getContributors
     * @param {IronAjaxEvent} e
     */
    handleNotebookFetchError(e) {
        this.defaultNotebookError = this._isolateErrorFromIronRequest(e);
        this.$.DefaultNotebookError.show();
    }

    /**
     * Iron-Ajax error handler for getContributors
     * @param {IronAjaxEvent} e
     */
    handleNotebookCreateError(e) {
        this.defaultNotebookError = this._isolateErrorFromIronRequest(e);
        this.$.DefaultNotebookError.show();
    }
}

customElements.define('notebook-default-card', NotebookDefaultCard);
