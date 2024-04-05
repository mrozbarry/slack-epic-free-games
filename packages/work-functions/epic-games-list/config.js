import * as path from 'node:path';

import 'dotenv/config';

import { dig } from './dig.js';

export const env = (key, fallback) =>
  dig(process.env, key, fallback);

const makeConfig = _config => {
  console.log('makeConfig', _config);
  return (key, fallback) => dig(_config, key.split('.'), fallback);
};

export const config = makeConfig({
  urls: {
    webhook: env('SLACK_WEBHOOK_URL'),
    epicFreeGamesUrl: env('EPIC_FREE_GAMES_URL', 'https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=CA&allowCountries=CA'),
    epicBase: 'https://store.epicgames.com/en-US',
    fallback: {
      banner: 'https://placehold.co/700x350'
    },
  },
});
