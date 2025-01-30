import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
// eslint-disable-next-line max-len
import {AppLocalizeBehavior} from '@polymer/app-localize-behavior/app-localize-behavior.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';

import {html, PolymerElement} from '@polymer/polymer';

import css from './dashboard-view.css';
import template from './dashboard-view.pug';
import './card-styles.js';
import './iframe-link.js';
import './notebook-default-card.js';
import './security-messages-card.js';
import './pipelines-card.js';
import './resource-chart.js';
import {getGCPData} from './resources/cloud-platform-data.js';
import utilitiesMixin from './utilities-mixin.js';
// eslint-disable
// eslint-disable-next-line max-len
export class DashboardView extends mixinBehaviors([AppLocalizeBehavior], utilitiesMixin(PolymerElement)) {
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
        /* eslint-disable no-console */
        console.log('woof');
        // eslint-enable no-console
        return {
            documentationItems: Array,
            quickLinks: Array,
            securityMessages: Array,
            namespace: Object,
            platformDetails: Object,
            metrics: Object,
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
