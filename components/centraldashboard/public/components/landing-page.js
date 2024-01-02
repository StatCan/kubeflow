import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/iron-a11y-keys/iron-a11y-keys.js';
import 'web-animations-js/web-animations-next.min.js';
import '@polymer/neon-animation/neon-animatable.js';
import '@polymer/neon-animation/neon-animated-pages.js';
import '@polymer/neon-animation/animations/fade-in-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';
// eslint-disable-next-line max-len
import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';

import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import './resources/md2-input/md2-input.js';
import './resources/carousel-indicator.js';
import './resources/animated-checkmark.js';
import css from './landing-page.css';
import template from './landing-page.pug';
import logo from '../assets/logo.svg';

import utilitiesMixin from './utilities-mixin.js';

/**
 * Entry point for application UI.
 * Replaces registration-page
 */
// eslint-disable-next-line max-len
export class LandingPage extends mixinBehaviors([AppLocalizeBehavior], utilitiesMixin(PolymerElement)) {
    static get template() {
        const vars = {logo};
        return html([
            `<style>${css.toString()}</style>${template(vars)}`]);
    }

    static get properties() {
        return {
            userDetails: {type: Object, observer: '_onUserDetails'},
            namespaceInput: {type: Object},
            namespaceName: String,
            error: Object,
            flowComplete: {type: Boolean, value: false},
            waitForRedirect: {type: Boolean, value: false},
            showAPIText: {type: Boolean, value: false},
        };
    }

    ready() {
        super.ready();
        this.namespaceInput = this.$.Namespace;
    }

    _onUserDetails(d) {
        this.namespaceName = this.userDetails
            // eslint-disable-next-line no-useless-escape
            .replace(/[^\w]|\./g, '-')
            .replace(/^-+|-+$|_/g, '')
            .toLowerCase();
    }


    clearInvalidation() {
        this.namespaceInput.invalid = false;
    }

    generateNamespace(email) {
        // Since email includes an @ , we split to the left side of it'
        const meow = email.split('@', 1);
        let nmeow = meow[0];
        nmeow = nmeow
            .replace(/[^\w]|\./g, '-')
            .replace(/^-+|-+$|_/g, '')
            .toLowerCase();

        let counter = 0;
        // Verify is namespace exists, if so add, check if contains number.
        if (this.ifNamespaceExists(nmeow)) {
            counter++;
            nmeow = nmeow + counter;
        }

        return nmeow;
    }

    async ifNamespaceExists(ns) {
        const profileAPI = this.$.GetMyNamespace;
        const req = profileAPI.generateRequest();
        await req.completes.catch(() => 0);
        if (req.response && req.response.hasWorkgroup) return true;
        return false;
    }

    getEmail() {
        return 'your-email';
    }
}


window.customElements.define('landing-page', LandingPage);
