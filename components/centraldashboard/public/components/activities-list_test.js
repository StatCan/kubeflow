import {flush} from '@polymer/polymer/lib/utils/flush.js';
import '@polymer/test-fixture/test-fixture';

import './activities-list';

const ONE_DAY = 24 * 60 * 60 * 1000;
const FIXTURE_ID = 'activities-list-fixture';
const ACTIVITIES_LIST_ID = 'test-activities-list';
const TEMPLATE = `
<test-fixture id="${FIXTURE_ID}">
  <template>
    <activities-list id="${ACTIVITIES_LIST_ID}"></activities-list>
  </template>
</test-fixture>
`;

describe('Activities List', () => {
    let activitiesList;

    beforeAll(() => {
        const div = document.createElement('div');
        div.innerHTML = TEMPLATE;
        document.body.appendChild(div);
    });

    beforeEach(() => {
        document.getElementById(FIXTURE_ID).create();
        activitiesList = document.getElementById(ACTIVITIES_LIST_ID);
    });

    afterEach(() => {
        document.getElementById(FIXTURE_ID).restore();
    });

    it('Shows two Activities By Day', () => {
        const today = new Date();
        const yesterday = new Date(today - ONE_DAY);
        activitiesList.activities = [{
            lastTimestamp: today.toISOString(),
            message: 'Something happened',
            type: 'Normal',
            involvedObject: {
                name: 'some-pod',
            },
        }, {
            lastTimestamp: yesterday.toISOString(),
            message: 'Something bad happened',
            type: 'Error',
            involvedObject: {
                name: 'a-failing-pod',
            },
        }];
        flush();

        const shadowRoot = activitiesList.shadowRoot;
        expect(shadowRoot.querySelectorAll('.activity-row').length).toBe(2);
        expect(shadowRoot.querySelectorAll('h2').length).toBe(2);
        expect(shadowRoot.querySelectorAll('h2')[0].innerText).toBe('Today');
        expect(shadowRoot.querySelectorAll('iron-icon.error').length).toBe(1);
    });
});
