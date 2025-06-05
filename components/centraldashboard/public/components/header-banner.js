import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-progress/paper-progress.js';
import './iframe-link.js';

import {html, PolymerElement} from '@polymer/polymer';

import './card-styles.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';

/**
 * Component to retrieve and display recently modified Jupyter Notebooks.
 */
/* eslint-disable */
export class HeaderBanner extends PolymerElement {
    static get template() {
        return html`
            <section class="banner-content">
                <div class="banner-icon">
                    <iron-icon icon="info"></iron-icon>
                </div>
                <div>
                    <template is="dom-if" if="[[!isMessagesList(msg)]]">
                        <template is="dom-repeat" items="[[msg]]">
                            <span>[[item]]</span>
                        </template>
                    </template>
                    <template is="dom-if" if="[[isMessagesList(msg)]]">
                        <ul>
                            <template is="dom-repeat" items="[[msg]]">
                                <li>[[item]]</li>
                            </template>
                        </ul>
                    </template>
                </div>
            </div>
        `;
    }

    static get properties() {
        return {
            msg: Array,
        };
    }

    /**
     * Check if messages is a list
     * @param {string} msg
     * @return {boolean} Is a list.
     */
    isMessagesList(msg) {
        console.log("MEOW", msg);
        return msg.length > 1;
    }
}

customElements.define('header-banner', HeaderBanner);
