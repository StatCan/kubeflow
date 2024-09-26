import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';

// eslint-disable-next-line max-len
import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {html, PolymerElement} from '@polymer/polymer';
import 'lodash';

import css from './manage-filers-view.css';
import template from './manage-filers-view.pug';
import utilitiesMixin from './utilities-mixin.js';

// eslint-disable-next-line max-len
export class ManageFilersView extends mixinBehaviors([AppLocalizeBehavior], utilitiesMixin(PolymerElement)) {
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
            errorText: {type: String, value: ''},
            responseText: {type: String, value: ''},
            validateError: {type: String, value: ''},
            namespace: String,
        };
    }
    /**
     * Main ready method for Polymer Elements.
     */
    ready() {
        super.ready();
    }

    isUserFiler(userFilers, filer) {
        return userFilers ? userFilers.includes(filer) : false;
    }

    isLoading(filersLoading, existingSharesLoading, requestingSharesLoading) {
        return filersLoading ||
            existingSharesLoading ||
            requestingSharesLoading;
    }

    /**
     * Set error message in case GET filers fails
     * @param {Event} ev AJAX-response
     */
    onHasFilersError(ev) {
        const error = ((ev.detail.request||{}).response||{})
            .error || ev.detail.error;
        this.showError(error);
        return;
    }

    /**
     * Show a toast error on main-page
     * @param {string} err Error message to show
     */
    showError(err) {
        this.errorText = err;
        this.$.FilersErrorToast.show();
    }

    /**
     * Show a toast success response on main-page
     * @param {string} text Success response message to show
     */
    showResponse(text) {
        this.responseText = text;
        this.$.FilersSuccessToast.show();
    }

    formatUserShares(userShares) {
        if (userShares === null) return [];

        const result = [];
        Object.keys(userShares).forEach((key)=>{
            result[key] = JSON.parse(userShares[key]);
            result.push({
                svm: key,
                shares: JSON.parse(userShares[key]),
            });
        });

        return result;
    }

    onChangeFilers(e) {
        this.validateError = '';
    }

    updateShares() {
        this.validateError = '';
        const formData = new FormData(this.$.filersForm);
        const requestingData = this.requestingShares === null ? {} :
            this.requestingShares;
        const existingData = this.existingShares === null ? {} :
            this.existingShares;

        const filersSelectValue = formData.get('filersSelect');
        let sharesInputValue = formData.get('sharesInput')
            .trim().replaceAll('\\', '/');

        // validate mandatory inputs
        if (filersSelectValue==='') {
            this.validateError = this.localize('manageFilersView.missingFiler');
            return;
        } else if (sharesInputValue==='') {
            this.validateError =
                this.localize('manageFilersView.invalidSharePath');
            return;
        }

        // Trim slashes for regex matching
        sharesInputValue = sharesInputValue.startsWith('/') ?
            sharesInputValue.slice(1) :
            sharesInputValue;
        sharesInputValue = sharesInputValue.endsWith('/') ?
            sharesInputValue.slice(0, -1) : sharesInputValue;

        // Error if the path doesn't look like a dir path
        if (!sharesInputValue.match(/^([^\\/:|<>*?]+\/?)*$/)) {
            this.validateError =
                this.localize('manageFilersView.invalidSharePath');
            return;
        }

        // cloning to avoid assigning by reference
        const newRequestingData = _.clone(requestingData);

        const newRequestingDataValue =
            newRequestingData[filersSelectValue] ?
                JSON.parse(newRequestingData[filersSelectValue]) :
                [];


        const existingFilerData = existingData[filersSelectValue] ?
            JSON.parse(existingData[filersSelectValue]) :
            [];
        // checking for duplicates
        if (newRequestingDataValue.includes(sharesInputValue) ||
            existingFilerData.includes(sharesInputValue)) {
            this.validateError =
                this.localize('manageFilersView.duplicateFiler');
            return;
        }

        newRequestingDataValue.push(sharesInputValue);

        newRequestingData[filersSelectValue] =
            JSON.stringify(newRequestingDataValue);

        // if no requesting CM, create it
        if (Object.keys(requestingData).length===0) {
            // new configmap to create
            const api = this.$.CreateRequestingSharesAjax;
            api.body = newRequestingData;
            api.generateRequest();
            return;
        }
        // else update the config map
        const api = this.$.UpdateRequestingSharesAjax;
        api.body = newRequestingData;
        api.generateRequest();
        return;
    }

    deleteExistingShare(e) {
        const filer = e.model.svm.svm;
        const filerShare = e.model.share;
        const existingData = this.existingShares === null ? {} :
            this.existingShares;

        const existingDataValue = JSON.parse(existingData[filer]);
        const index = existingDataValue.indexOf(filerShare);
        if (index===-1) {
            this.showError(
                this.localize(
                    'manageFilersView.missingDeleteError',
                    'filerShare',
                    filerShare
                )
            );
            return;
        }

        // delete the configmap if only contains this filershare
        if (existingDataValue.length===1 &&
                Object.keys(existingData).length===1) {
            const api = this.$.DeleteExistingSharesAjax;
            api.generateRequest();
            return;
        }

        // cloning to avoid assigning by reference
        const newExistingData = _.clone(existingData);

        existingDataValue.splice(index, 1);
        // remove filer from configmap if it contains no more values
        if (existingDataValue.length===0) {
            delete newExistingData[filer];
        } else {
            newExistingData[filer] = JSON.stringify(existingDataValue);
        }

        const api = this.$.UpdateExistingSharesAjax;
        api.body = newExistingData;
        api.generateRequest();
        return;
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
     * Iron-Ajax response / error handler for updateFilers
     * @param {IronAjaxEvent} e
     */
    handleUpdateShares(e) {
        this.$.filersSelect.value = '';
        this.$.sharesInput.value = '';

        if (e.detail.error) {
            const error = this._isolateErrorFromIronRequest(e);
            this.showError(error);
            return;
        }

        this.showResponse(this.localize('manageFilersView.successUpdate'));

        // updates the data
        this.$.GetRequestingSharesAjax.generateRequest();
        this.$.GetExistingSharesAjax.generateRequest();
        return;
    }

    /*
    for the filers table.
    Determines if the header should be displayed
    polymer templating requires this to be a function as just inputing
    the boolean comparaison does not work
    */
    renderHeader(i) {
        return i === 0;
    }

    /*
    for the filers table.
    Determines if the count of the items, returning a string
    */
    getRowspan(items) {
        return items.length;
    }
}

customElements.define('manage-filers-view', ManageFilersView);
