import {html, PolymerElement} from '@polymer/polymer';
// eslint-disable-next-line max-len
import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
// eslint-disable-next-line max-len
export class NotFoundView extends mixinBehaviors([AppLocalizeBehavior], PolymerElement) {
    static get template() {
        return html`
            <style>
                :host {
                    background: #f1f3f4;
                    color: var(--google-grey-500);
                    font-style: italic;
                    font-size: 2em;
                    font-family: Google Sans;
                    padding: 1em;
                    text-align: center;
                    align-self: center;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                }
            </style>
            <p>{{localize('invalidPagePart1')}}<strong>[[path]]</strong>
                {{localize('invalidPagePart2')}}</p>
        `;
    }

    constructor() {
        super();
        this.resources = {
            'en': {
                'invalidPagePart1': 'Sorry, ',
                'invalidPagePart2': ' is not a valid page',
            },
            'fr': {
                'invalidPagePart1': 'Désolé, ',
                'invalidPagePart2': ' n\'est pas une page valide',
            },
        };
        this.language = this.getBrowserLang();
    }

    getBrowserLang() {
        if (typeof window === 'undefined' ||
            typeof window.navigator === 'undefined') {
            return undefined;
        }

        let browserLang = window.navigator.languages ?
            window.navigator.languages[0] : null;
        browserLang = browserLang || window.navigator.language ||
            window.navigator.browserLanguage || window.navigator.userLanguage;

        if (typeof browserLang === 'undefined') {
            return undefined;
        }

        if (browserLang.indexOf('-') !== -1) {
            browserLang = browserLang.split('-')[0];
        }

        if (browserLang.indexOf('_') !== -1) {
            browserLang = browserLang.split('_')[0];
        }

        return browserLang;
    }

    /**
     * Object describing property-related metadata used by Polymer features
     */
    static get properties() {
        return {
            path: String,
        };
    }
}

window.customElements.define('not-found-view', NotFoundView);
