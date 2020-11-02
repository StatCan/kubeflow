import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
// eslint-disable-next-line max-len
import {AppLocalizeBehavior} from "@polymer/app-localize-behavior/app-localize-behavior.js";
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

    constructor(){
        super();
        this.resources = {
            "en": {
                "headingQuickLinks":"Quick shortcuts",
                "quicklinkUploadText": "Upload a pipeline",
                "quicklinkUploadDesc": "Pipelines",
                "quicklinkViewAllText": "View all pipeline runs",
                "quicklinkViewAllDesc": "Pipelines",
                "quicklinkCreateNewText": "Create a new Notebook server",
                "quicklinkCreateNewDesc": "Notebook Servers",
                "quicklinkViewKatibText": "View Katib Studies",
                "quicklinkViewKatibDesc": "Katib",
                "quicklinkMetadataArtifactsText": "View Metadata Artifacts",
                "quicklinkMetadataArtifactsDesc": "Artifact Store",
                "headingRecentPipelines": "Recent Pipelines",
                "headingDocumentation": "Documentation",
                "docItemAAWDText": "FR Advanced Analytics Workspace Docs",
                "docItemAAWDDesc": "FR Helpful guides about our data and " +
                    "analysis tools",
                "docItemVideoTutorialText": "Video Tutorial Series",
                "docItemVideoTutorialDesc": "YouTube playlist of videos " +
                "for getting started with Advanced Analytics Workspace tools",
                "docItemCommunityChatText": "Community Chat",
                "docItemCommunityChatDesc": "Slack workspace for " + 
                    "discussion/support - requires sign-up for emails " +
                    "outside @canada.ca",
                "docItemOfficialKubeflowDocsText": "Official Kubeflow Docs",
                "docItemOfficialKubeflowDocsDesc": "Advanced documentation " +
                    "for installing, running, and using Kubeflow"
            },
            "fr": {
                "headingQuickLinks":"Raccourcis",
                "quicklinkUploadText": "FR Upload a pipeline",
                "quicklinkUploadDesc": "Pipelines",
                "quicklinkViewAllText": "FR View all pipeline runs",
                "quicklinkViewAllDesc": "Pipelines",
                "quicklinkCreateNewText": "FR Create a new Notebook server",
                "quicklinkCreateNewDesc": "FR Notebook Servers",
                "quicklinkViewKatibText": "FR View Katib Studies",
                "quicklinkViewKatibDesc": "Katib",
                "quicklinkMetadataArtifactsText": "FR View Metadata Artifacts",
                "quicklinkMetadataArtifactsDesc": "FR Artifact Store",
                "headingRecentPipelines": "Pipelines Recentes",
                "headingDocumentation": "Documentation",
                "docItemAAWDText": "FR Advanced Analytics Workspace Docs",
                "docItemAAWDDesc": "FR Helpful guides about our data and " +
                    "analysis tools",
                "docItemVideoTutorialText": "FR Video Tutorial Series",
                "docItemVideoTutorialDesc": "FR YouTube playlist of videos " +
                    "for getting started with Advanced Analytics Workspace " +
                    "tools",
                "docItemCommunityChatText": "FR Community Chat",
                "docItemCommunityChatDesc": "FR Slack workspace for " +
                    "discussion/support - requires sign-up for emails " +
                    "outside @canada.ca",
                "docItemOfficialKubeflowDocsText": "FR Official Kubeflow Docs",
                "docItemOfficialKubeflowDocsDesc": "FR Advanced documentation"+
                    " for installing, running, and using Kubeflow"
            }
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
            return undefined
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
                        text: 'docItemAAWDText',
                        desc: 'docItemAAWDDesc',
                        link: `https://statcan.github.io/daaas/`,
                    },
                    {
                        text: 'docItemVideoTutorialText',
                        desc: 'docItemVideoTutorialDesc',
                        link: `https://www.youtube.com/playlist?list=PL1zlA2D7AHugkDdiyeUHWOKGKUd3MB_nD`,
                    },
                    {
                        text: 'docItemCommunityChatText',
                        desc: 'docItemCommunityChatDesc',
                        link: `https://statcan-aaw.slack.com/`,
                    },
                    {
                        text: 'docItemOfficialKubeflowDocsText',
                        desc: 'docItemOfficialKubeflowDocsDesc',
                        link: `https://www.kubeflow.org/docs/`,
                    },
                ],
            },
            namespace: String,
            quickLinks: {
                type: Array,
                value: [
                    {
                        text: 'quicklinkUploadText',
                        desc: 'quicklinkUploadDesc',
                        link: `/pipeline/`,
                    },
                    {
                        text: 'quicklinkViewAllText',
                        desc: 'quicklinkViewAllDesc',
                        link: `/pipeline/#/runs`,
                    },
                    {
                        text: 'quicklinkCreateNewText',
                        desc: 'quicklinkCreateNewDesc',
                        link: `/jupyter/new?namespace=kubeflow`,
                    },
                    {
                        text: 'quicklinkViewKatibText',
                        desc: 'quicklinkViewKatibDesc',
                        link: `/katib/`,
                    },
                    {
                        text: 'quicklinkMetadataArtifactsText',
                        desc: 'quicklinkMetadataArtifactsDesc',
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
