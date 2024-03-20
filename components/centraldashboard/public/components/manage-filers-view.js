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
            // helps to trigger changes for the shares list
            filersFormValue: {type: String, value: ''},
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

    isLoading(filersLoading, userFilersLoading) {
        return filersLoading || userFilersLoading;
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

    formatUserFilers(userFilers) {
        if (userFilers === null) return [];
        const result = JSON.parse(userFilers.filerShares);

        return result;
    }

    /**
     * Returns filers
     * @param {Object} filers Set of filers to format
     * @return {[[string]]} rows for filers table.
     */
    formatFilers(filers) {
        if (filers === null) return [];
        return Object.keys(filers).map((key)=>{
            return {key: key, name: filers[key].name,
                shares: filers[key].shares};
        });
    }

    getShares(filer) {
        return this.filersFormValue === ''? [] : this.filers[filer].shares;
    }

    onChangeFilers(e) {
        this.filersFormValue = e.target.value;
        this.$.sharesSelect.value = '';
        this.validateError = '';
    }

    onChangeShares() {
        this.validateError = '';
    }

    updateFilers() {
        this.validateError = '';
        const formData = new FormData(this.$.filersForm);
        const userData = this.userFilers === null ? [] :
            JSON.parse(this.userFilers.filerShares);
        // validate mandatory inputs
        if (formData.get('filersSelect')==='') {
            this.validateError = 'Please select a filer';
            return;
        } else if (formData.get('sharesSelect')==='') {
            this.validateError = 'Please select a share';
            return;
        }
        // cloning to avoid assigning by reference
        const newUserData = _.clone(userData);
        const newValue = formData.get('filersSelect') + '/' +
            formData.get('sharesSelect')+'/';
        if (newUserData.includes(newValue)) {
            this.validateError = 'User already has filer share';
            return;
        }

        newUserData.push(newValue);
        const newConfigmap = {filerShares: JSON.stringify(newUserData)};

        if (Object.keys(userData).length===0) {
            // new configmap to create
            const api = this.$.CreateFilerAjax;
            api.body = newConfigmap;
            api.generateRequest();
            return;
        }
        // else is update the config map
        const api = this.$.UpdateFilerAjax;
        api.body = newConfigmap;
        api.generateRequest();
        return;
    }

    deleteFilerShare(e) {
        const filerShare = e.model.item;
        const userData = this.userFilers === null ? [] :
            JSON.parse(this.userFilers.filerShares);
        const index = userData.indexOf(filerShare);
        if (index===-1) {
            this.showError(`User does not have filer share ${filerShare}`);
            return;
        }
        if (userData.length===1) {
            // delete the configmap if only contains this filershare
            const api = this.$.DeleteFilerAjax;
            api.generateRequest();
            return;
        }

        userData.splice(index, 1);
        const newConfigmap = {filerShares: JSON.stringify(userData)};
        // else is update the config map
        const api = this.$.UpdateFilerAjax;
        api.body = newConfigmap;
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
    handleUpdateFilers(e) {
        this.filersFormValue = '';
        this.$.filersSelect.value = '';
        this.$.sharesSelect.value = '';

        if (e.detail.error) {
            const error = this._isolateErrorFromIronRequest(e);
            this.showError(error);
            return;
        }
        this.showResponse(this.localize('manageFilersView.successUpdate'));
        this.userFilers = _.isEmpty(e.detail.response) ? null :
            e.detail.response;
        return;
    }
}

customElements.define('manage-filers-view', ManageFilersView);
