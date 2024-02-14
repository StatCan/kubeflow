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
        };
    }

    _isNotebookReady() {
        return this.defaultNotebook.notebook.status.phase == 'ready';
    }
    _isCreateDisabled() {
        return this.loading;
    }
    _getNamespace() {
        if (this.namespace == undefined) {
            return false;
        }
        return this.namespace;
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
        await APICreateDefault.generateRequest().completes.catch((e) => e);
        this.loading = false;
    }

    /**
     * Takes an event from iron-ajax and isolates the error from a request that
     * failed
     * @param {IronAjaxEvent} e
     * @return {string}
     */
    _isolateErrorFromIronRequest(e) {
        const bd = e.detail.request.response||{};
        return bd.error || bd.log || e.detail.error || e.detail;
    }

    /**
     * Iron-Ajax response for creating new Default Notebook
     * @param {IronAjaxEvent} e
     */
    handleNotebookCreate(e) {
        this.defaultNotebook = e.detail.response.notebook;
        this.defaultNotebookError = '';
        this.loading = false;
    }


    // Methods to handle errors when triggered by ajax called
    handleNotebookFetchError(e) {
        this.defaultNotebookError = this._isolateErrorFromIronRequest(e);
        this.$.DefaultNotebookError.show();
        this.loading = false;
    }
    handleNotebookCreateError(e) {
        this.defaultNotebookError = this._isolateErrorFromIronRequest(e);
        this.$.DefaultNotebookError.show();
        this.loading = false;
    }
}

customElements.define('notebook-default-card', NotebookDefaultCard);
