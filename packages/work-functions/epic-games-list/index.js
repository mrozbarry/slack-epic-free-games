import { fetch } from './fetch.js';
import { config } from './config.js';
import * as epicFreePromotions from './transformers/epicFreePromotions.js';

export const main = (...args) => {
  console.log('[main] args', args);

  const url = config('urls.epicFreeGamesUrl')
  return fetch(url)
    .then(r => r.json())
    .then(async (payload) => ({
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "Free Epic Games",
            "emoji": true
          }
        },
        ...(await epicFreePromotions.toSlackBlocks(payload)).flat(),
      ],
    }))
    .then(blocks => {
      // console.log('[blocks]', JSON.stringify(blocks, null, 2));
      return fetch(config('urls.webhook'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(blocks),
      })
      .then(async (response) => {
        return {
          body: [
            'ok',
            {
              httpStatus: response.status,
              response: await response.text(),
              blocks,
            }
          ],
        };
      });
    })
    .catch((err) => {
      console.error('Unable to get epic games list', err);
    });
}
