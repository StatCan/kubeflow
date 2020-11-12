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

    /**
     * Object describing property-related metadata used by Polymer features
     */
    static get properties() {
        return {
            documentationItems: {
                type: Array,
                value: [
                    {
                        text: 'Advanced Analytics Workspace Docs',
                        desc: 'Helpful guides about our data and analysis ' +
                            'tools',
                        link: `https://statcan.github.io/daaas/`,
                    },
                    {
                        text: 'Video Tutorial Series',
                        desc: 'YouTube playlist of videos for getting ' +
                            'started with Advanced Analytics Workspace tools',
                        link: `https://www.youtube.com/playlist?list=PL1zlA2D7AHugkDdiyeUHWOKGKUd3MB_nD`,
                    },
                    {
                        text: 'Community Chat',
                        desc: 'Slack workspace for discussion/support - ' +
                            'requires sign-up for emails outside @canada.ca',
                        link: `https://statcan-aaw.slack.com/`,
                    },
                    {
                        text: 'Official Kubeflow Docs',
                        desc: 'Advanced documentation for installing, ' +
                            'running, and using Kubeflow',
                        link: `https://www.kubeflow.org/docs/`,
                    },
                ],
            },
            namespace: String,
            quickLinks: {
                type: Array,
                value: [
                    {
                        text: 'Upload a pipeline',
                        desc: 'Pipelines',
                        link: `/pipeline/`,
                    },
                    {
                        text: 'View all pipeline runs',
                        desc: 'Pipelines',
                        link: `/pipeline/#/runs`,
                    },
                    {
                        text: 'Create a new Notebook server',
                        desc: 'Notebook Servers',
                        link: `/jupyter/new?namespace=kubeflow`,
                    },
                    {
                        text: 'View Katib Studies',
                        desc: 'Katib',
                        link: `/katib/`,
                    },
                    {
                        text: 'View Metadata Artifacts',
                        desc: 'Artifact Store',
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
