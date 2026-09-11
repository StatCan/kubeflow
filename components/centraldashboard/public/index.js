// Entrypoint for Webpack
// eslint-disable-next-line camelcase,no-undef
__webpack_nonce__ = 'random123';

import '@babel/polyfill';

import './styles.css';

// Uses Webpack specific syntax to require all favicons
// eslint-disable-next-line no-undef
require.context('./assets', false, /favicon/);

import './components/main-page.js';
