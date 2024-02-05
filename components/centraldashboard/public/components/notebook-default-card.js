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
            contribError: Object,
            namespace: String,
            defaultNotebook: {type: Object, value: undefined},
            loading: Boolean,
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

    isNotebookReady(t) {
        this.defaultNotebook = t;
        const z = this.defaultNotebook.status.phase == 'ready';
        return z;
    }

    isLoading() {
        return this.loading;
    }

    /**
     * Main ready method for Polymer Elements.
     */
    ready() {
        super.ready();
        // this.contributorInputEl = this.$.ContribEmail;
    }

    /**
     * Triggers an API call to create a new Contributor
     */
    addNewContrib() {
        // Need to call the api directly here.
        const api = this.$.AddContribAjax;
        api.body = {contributor: this.newContribEmail};
        api.generateRequest();
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
    handleContribCreate(e) {
        if (e.detail.error) {
            const error = this._isolateErrorFromIronRequest(e);
            if (error.search('fdi') === -1) {
                this.contribCreateError =
                    'NotebookDefaultCard.errorCreateGeneral';
                return;
            } else {
                this.contribCreateError =
                    'NotebookDefaultCard.errorCreateFDI';
                return;
            }
        }
        this.contributorList = e.detail.response;
        this.newContribEmail = this.contribCreateError = '';
    }
    handlechFetNotebook(e) {
        if (e.detail.error) {
            const error = this._isolateErrorFromIronRequest(e);
            alert(error);
        }
        this.defaultNotebook = e.detail.response.notebook;
    }

    /**
     * Iron-Ajax response / error handler for removeContributor
     * @param {IronAjaxEvent} e
     */
    handleContribDelete(e) {
        if (e.detail.error) {
            // const error = this._isolateErrorFromIronRequest(e);
            this.contribCreateError =
                'NotebookDefaultCard.errorDeleteGeneral';
            return;
        }
        this.contributorList = e.detail.response;
        this.newContribEmail = this.contribCreateError = '';
    }
    /**
     * Iron-Ajax error handler for getContributors
     * @param {IronAjaxEvent} e
     */
    handleNotebookFetchErrpr(e) {
        const error = this._isolateErrorFromIronRequest(e);
        this.contribError = error;
        alert(error);
        this.$.ContribError.show();
    }

    /**
     * Iron-Ajax error handler for getContributors
     * @param {IronAjaxEvent} e
     */
    onContribFetchError(e) {
        const error = this._isolateErrorFromIronRequest(e);
        this.contribError = error;
        alert(error);
    }
}
/* eslint-disable max-len */
customElements.define('notebook-default-card', NotebookDefaultCard
);
