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

import './card-styles.js';
import css from './notebook-default-card3.css';
import template from './notebook-default-card3.pug';

import utilitiesMixin from './utilities-mixin.js';

/**
 * Entry point for application UI.
 * Replaces registration-page
 */
// eslint-disable-next-line max-len
export class NotebookDefaultCard3 extends mixinBehaviors([AppLocalizeBehavior], utilitiesMixin(PolymerElement)) {
    static get template() {
        return html([`
            <style>${css.toString()}</style>
            ${template}
        `]);
    }

    static get properties() {
        return {
            namespace: String,
            error: Object,
            flowComplete: {type: Boolean, value: false},
            waitForRedirect: {type: Boolean, value: false},
        };
    }

    ready() {
        super.ready();
    }


    async _createDefaultNotebook() {
        // Create the default notebook
        const APICreateDefault = this.$.CreateDefaultNotebook;

        await APICreateDefault.generateRequest().completes.catch((e) => e);
        await this.sleep(1); // So the errors and callbacks can schedule
        if (this.error && this.error.response) {
            if (this.error.response.error) {
                this.set('error', {response: {
                    error: 'registrationPage.errCreateNotebook',
                    namespace: this.name,
                }});
            }
            return this.waitForRedirect = false;
        }
        this.waitForRedirect = false;
    }

    _successSetup() {
        this.flowComplete = true;
        this.set('error', {});
        this.fireEvent('flowcomplete');
    }
}


window.customElements.define('notebook-default-card3', NotebookDefaultCard3);
