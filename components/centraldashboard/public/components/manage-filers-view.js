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
        return userFilers ? Object.keys(userFilers).includes(filer) : false;
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

    /**
     * Returns filers
     * @param {Object} filers Set of filers to format
     * @return {[[string]]} rows for filers table.
     */
    formatFilers(filers) {
        if (filers === null) return [];

        return Object.keys(filers).map((key)=>{
            return {name: key, value: filers[key]};
        });
    }

    formatFormData(formData) {
        const result = {};
        formData.forEach((i)=>{
            result[i]= 'true';
        });
        return result;
    }

    updateFilers() {
        const formData = new FormData(this.$.filersForm).getAll('filers-check');
        const newConfigmap = this.formatFormData(formData);
        const userData = this.userFilers === null ? {} : this.userFilers;

        if (_.isEqual(userData, newConfigmap)) {
            // no new data, do nothing
            return;
        }

        if (formData.length===0) {
            // delete the configmap
            const api = this.$.DeleteFilerAjax;
            api.generateRequest();
            return;
        }

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
        if (e.detail.error) {
            const error = this._isolateErrorFromIronRequest(e);
            this.showError(error);
            return;
        }
        this.showResponse(this.localize('manageFilersView.successUpdate'));
        this.userFilers = e.detail.response;
        return;
    }
}

customElements.define('manage-filers-view', ManageFilersView);
