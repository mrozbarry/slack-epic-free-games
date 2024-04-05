import { dig } from '../dig.js';
import { config } from '../config.js';

const data = (payload) =>
  dig(payload, 'data.Catalog.searchStore.elements', [])
    .filter(game =>
      dig(game, 'promotions.upcomingPromotionalOffers', []).length > 0
    );

const imageTypes = ['ProductLogo', 'Thumbnail'];

export const toSlackBlocks = (payload) => {
  return data(payload)
    .map(game => [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${game.title}* - ${game.description}`,
        },
        accessory: {
          type: "image",
          image_url: dig(game.keyImages.find(img => imageTypes.includes(img.type)), 'url', config('urls.fallback.banner')),
          alt_text: `${game.name} product logo`,
        }
      },
    ])
}
