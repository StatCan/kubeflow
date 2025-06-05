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
            <style include="paper-material-styles">
                .banner-content {
                    display: flex;
                    flex-direction: column;
                    background-color: orange;
                }
                
                .banner-item {
                    botder: 1px solid black;
                    display: flex;
                    flex: 1 1 auto;
                }
                .banner-icon {
                    width: 30px;
                    background: purple;
                    height: 100%;
                    margin-right: 10px;
                    align-self: center;
                }

                .banner-item-text{
                    flex: 1;
                    padding: 10 px;
                    background: green;
                    overflow-wrap: break-word;
                }
            </style>
            <section class="banner-content">
                <template is="dom-repeat" items="[[msg]]">
                    <section class="banner-item">
                        <div class="banner-icon">
                            <iron-icon icon="info"></iron-icon>
                        </div>
                        <div class="banner-item-text">[[item]]</div>
                    </section>
                    <section class="banner-item">
                        <div class="banner-icon">
                            <iron-icon icon="info"></iron-icon>
                        </div>
                        <div class="banner-item-text">[[item]]</div>
                    <section>
                </template>
            </section>
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
        return msg.length > 1;
    }
}

customElements.define('header-banner', HeaderBanner);
