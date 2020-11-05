// eslint-disable-next-line max-len
import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {languages} from '../assets/i18n/languages.json';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {PolymerElement} from '@polymer/polymer';

// eslint-disable-next-line max-len
export default class extends mixinBehaviors([AppLocalizeBehavior], PolymerElement) {
    constructor() {
        super();
        this.resources = languages;
        const currentLanguage = this.getBrowserLang();
        // eslint-disable-next-line max-len
        const lang = (currentLanguage != undefined && currentLanguage.match(/en|fr/)) ? currentLanguage : 'en';
        this.language = lang;
    }

    // Get the language based on the browser
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
}
