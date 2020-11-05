import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
// eslint-disable-next-line max-len
import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import utilitiesMixin from './utilities-mixin.js';

import {html, PolymerElement} from '@polymer/polymer';

import css from './dashboard-view.css';
import template from './dashboard-view.pug';
import './card-styles.js';
import './iframe-link.js';
import './notebooks-card.js';
import './pipelines-card.js';
import './resource-chart.js';
import {getGCPData} from './resources/cloud-platform-data.js';
import {localisation} from '../assets/i18n/localisation.json'

// eslint-disable-next-line max-len
export class DashboardView extends utilitiesMixin( mixinBehaviors([AppLocalizeBehavior], PolymerElement)) {
    static get template() {
        return html([`
            <style include="card-styles">
                ${css.toString()}
            </style>
            ${template()}
        `]);
    }

    constructor() {
        super();
        this.resources = localisation;
        const currentLanguage = this.getBrowserLang();
        const lang = (currentLanguage == undefined && currentLanguage.match(/en|fr/)) ? currentLanguage : 'en';
        this.language = lang;
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
            documentationItems: {
                type: Array,
                value: [
                    {
                        text: 'dashboardView.docItemAAWDText',
                        desc: 'dashboardView.docItemAAWDDesc',
                        link: 'dashboardView.docItemAAWDLink',
                    },
                    {
                        text: 'dashboardView.docItemVideoTutorialText',
                        desc: 'dashboardView.docItemVideoTutorialDesc',
                        link: 'dashboardView.docItemVideoTutorialLink',
                    },
                    {
                        text: 'dashboardView.docItemCommunityChatText',
                        desc: 'dashboardView.docItemCommunityChatDesc',
                        link: 'dashboardView.docItemCommunityChatLink',
                    },
                    {
                        text: 'dashboardView.docItemOfficialKubeflowDocsText',
                        desc: 'dashboardView.docItemOfficialKubeflowDocsDesc',
                        link: 'dashboardView.docItemOfficialKubeflowDocsLink',
                    },
                ],
            },
            namespace: String,
            quickLinks: {
                type: Array,
                value: [
                    {
                        text: 'dashboardView.quicklinkUploadText',
                        desc: 'dashboardView.quicklinkUploadDesc',
                        link: `/pipeline/`,
                    },
                    {
                        text: 'dashboardView.quicklinkViewAllText',
                        desc: 'dashboardView.quicklinkViewAllDesc',
                        link: `/pipeline/#/runs`,
                    },
                    {
                        text: 'dashboardView.quicklinkCreateNewText',
                        desc: 'dashboardView.quicklinkCreateNewDesc',
                        link: `/jupyter/new?namespace=kubeflow`,
                    },
                    {
                        text: 'dashboardView.quicklinkViewKatibText',
                        desc: 'dashboardView.quicklinkViewKatibDesc',
                        link: `/katib/`,
                    },
                    {
                        text: 'dashboardView.quicklinkMetadataArtifactsText',
                        desc: 'dashboardView.quicklinkMetadataArtifactsDesc',
                        link: `/metadata/`,
                    },
                ],
            },
            platformDetails: Object,
            platformInfo: {
                type: Object,
                observer: '_platformInfoChanged',
            },
        };
    }

    /**
     * Observer for platformInfo property
     */
    _platformInfoChanged() {
        if (this.platformInfo && this.platformInfo.providerName === 'gce') {
            this.platformName = 'GCP';
            const pieces = this.platformInfo.provider.split('/');
            let gcpProject = '';
            if (pieces.length >= 3) {
                gcpProject = pieces[2];
            }
            this.platformDetails = getGCPData(gcpProject);
        }
    }
}

customElements.define('dashboard-view', DashboardView);
