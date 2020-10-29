import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/social-icons.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column.js';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column.js';

import {html, PolymerElement} from '@polymer/polymer';

import './resources/paper-chip.js';
import './resources/md2-input/md2-input.js';
import css from './manage-users-view.css';
import template from './manage-users-view.pug';
import utilitiesMixin from './utilities-mixin.js';

export class ManageUsersView extends utilitiesMixin(PolymerElement) {
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
            user: {type: String, value: 'Loading...'},
            isClusterAdmin: {type: Boolean, value: false},
            namespaces: Array,
            ownedNamespace: {type: Object, value: () => ({})},
            newContribEmail: String,
            contribError: Object,
            contributorInputEl: Object,
        };
    }
    /**
     * Main ready method for Polymer Elements.
     */
    ready() {
        super.ready();
        this.contributorInputEl = this.$.ContribEmail;
    }
    /**
     * Returns namespaces and roles
     * @param {[object]} ns Namespaces array.
     * @return {[string, [string]]} rows for namespace table.
     */
    nsBreakdown(ns) {
        const {ownedNamespace, namespaces} = this;
        if (!ownedNamespace || !namespaces) return;
        const arr = [];
        for (let i = 0; i < namespaces.length; i++) {
            arr.push(
                [namespaces[i].namespace,
                    this.uppercaseFirst(namespaces[i].role)],
            );
        }
        return arr;
    }

    /**
     * Used to uppercase the first letter of the role name
     * @param {string} string A string
     * @return {string} A string where the first character is capitalized
     */
    uppercaseFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * Triggers an API call to create a new Contributor
     */
    addNewContrib(e) {
        // Need to call the api directly here.
        const api = this.$.AddContribAjax;
        api.body = {contributor: e.target.$.inputElement.value};
        api.generateRequest();
    }
    /**
     * Triggers an API call to remove a Contributor
     * @param {Event} e
     */
    removeContributor(e) {
        const api = this.$.RemoveContribAjax;
        api.body = {contributor: e.model.item};
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
            this.contribCreateError = error;
            return;
        }
        this.contributorList = e.detail.response;
        this.newContribEmail = this.contribCreateError = '';
    }
    /**
     * Iron-Ajax response / error handler for removeContributor
     * @param {IronAjaxEvent} e
     */
    handleContribDelete(e) {
        if (e.detail.error) {
            const error = this._isolateErrorFromIronRequest(e);
            this.contribCreateError = error;
            return;
        }
        this.contributorList = e.detail.response;
        this.newContribEmail = this.contribCreateError = '';
    }
    /**
     * Iron-Ajax error handler for getContributors
     * @param {IronAjaxEvent} e
     */
    onContribFetchError(e) {
        const error = this._isolateErrorFromIronRequest(e);
        this.contribError = error;
        this.$.ContribError.show();
    }
    /**
     * Iron-Ajax error handler for getContributors
     * @param {IronAjaxEvent} e
     */
    onAllNamespaceFetchError(e) {
        const error = this._isolateErrorFromIronRequest(e);
        this.allNamespaceError = error;
        this.$.AllNamespaceError.show();
    }
    /**
     * [ComputedProp] Should the ajax call for all namespaces run?
     * @param {object} ownedNamespace
     * @param {boolean} isClusterAdmin
     * @return {boolean}
     */
    shouldFetchAllNamespaces(ownedNamespace, isClusterAdmin) {
        return isClusterAdmin && !this.empty(ownedNamespace);
    }
}

customElements.define('manage-users-view', ManageUsersView);
