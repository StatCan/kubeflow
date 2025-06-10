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
                }
                
                .banner-item {
                    display: flex;
                    flex: 1 1 auto;
                    padding: 10px;
                }
                .banner-icon {
                    width: 30px;
                    height: 100%;
                    margin-right: 10px;
                    align-self: center;
                }

                .banner-item-text{
                    flex: 1;
                    
                    overflow-wrap: break-word;
                    align-self: center;

                }
                .info{
                    color: #004085;
                    background-color: #cce5ff;
                    border-color: #b8daff;
                }
                .warning{
                    color: #856404;
                    background-color: #fff3cd;
                    border-color: #ffeeba;
                }
                .error{
                    color: #721c24;
                    background-color: #f8d7da;
                    border-color: #f5c6cb;
                }
            </style>
            <section class="banner-content">
                <template is="dom-repeat" items="[[msg]]" as="n">
                    <section class$="banner-item {{n.type}}">
                        <div class="banner-icon">
                            <iron-icon icon$="{{n.type}}"></iron-icon>
                        </div>
                        <div class="banner-item-text">                                              
                                [[n.message]]
                        </div>
                    </section>
                </template>
            </section>
        `;
    }

    static get properties() {
        return {
            msg: Array,
            language: {
                type: String,
                value: "fr"
            }
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

    bannerStyle(n) {
        return n.type;
    }
}

customElements.define('header-banner', HeaderBanner);
