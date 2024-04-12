import '@polymer/paper-card/paper-card.js';
import 'web-animations-js/web-animations-next.min.js';
import '@polymer/neon-animation/neon-animatable.js';
import '@polymer/neon-animation/neon-animated-pages.js';
import '@polymer/neon-animation/animations/fade-in-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';
import '@polymer/paper-button/paper-button.js';
// eslint-disable-next-line max-len
import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {html, PolymerElement} from '@polymer/polymer';

import css from './blocked-user-view.css';
import template from './blocked-user-view.pug';
import logo from '../assets/logo.svg';

// eslint-disable-next-line max-len
export class BlockedUserView extends mixinBehaviors([AppLocalizeBehavior], PolymerElement) {
    static get template() {
        const vars = {logo};
        return html([
            `<style>${css.toString()}</style>${template(vars)}`]);
    }

    /**
     * Object describing property-related metadata used by Polymer features
     */
    static get properties() {
        return {
        };
    }

    async logout() {
        location.href = `/logout`;
    }
}

window.customElements.define('blocked-user-view', BlockedUserView);
