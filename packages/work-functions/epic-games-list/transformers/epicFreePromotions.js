import { dig } from '../dig.js';
import { config } from '../config.js';
import { fetch } from '../fetch.js';

// new: https://store.epicgames.com/graphql?operationName=getCatalogOffer&variables={"locale":"en-US","country":"CA","offerId":"0bce0871129140d894da3789e2fe0a7f","sandboxId":"8211dc6089af4542926b7a8137b9079e"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"6797fe39bfac0e6ea1c5fce0ecbff58684157595fee77e446b4254ec45ee2dcb"}}
// new: https://store.epicgames.com/graphql?operationName=getCatalogOffer&variables={"locale":"en-US","country":"CA","offerId":"97576d7026ab4e4181fdf9b8711a95d9","sandboxId":"cea01263911a4e179a5e3892ef710930"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"6797fe39bfac0e6ea1c5fce0ecbff58684157595fee77e446b4254ec45ee2dcb"}}
//
//ttps://store.epicgames.com/graphql?operationName=getCatalogOffer&variables={"locale":"en-US","country":"CA","offerId":"508291c29513464b84c1b701edf3d8f4","sandboxId":"e209b2d1d5384f639335f64e3e6c4bb8"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"6797fe39bfac0e6ea1c5fce0ecbff58684157595fee77e446b4254ec45ee2dcb"}}
//
// old:
// https://store.epicgames.com/graphql?operationName=getCatalogOffer&variables={"locale":"en-US","country":"CA","offerId":"${game.id}","sandboxId":"${game.namespace}"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"6797fe39bfac0e6ea1c5fce0ecbff58684157595fee77e446b4254ec45ee2dcb"}}
// https://store.epicgames.com/graphql?operationName=getCatalogOffer&variables={%22locale%22:%22en-US%22,%22country%22:%22CA%22,%22offerId%22:%2297576d7026ab4e4181fdf9b8711a95d9%22,%22sandboxId%22:%22cea01263911a4e179a5e3892ef710930%22}&extensions={%22persistedQuery%22:{%22version%22:1,%22sha256Hash%22:%226797fe39bfac0e6ea1c5fce0ecbff58684157595fee77e446b4254ec45ee2dcb%22}}

const imageTypes = ['ProductLogo', 'Thumbnail'];

const data = (payload) =>
  Promise.all(
    dig(payload, 'data.Catalog.searchStore.elements', [])
      .filter(game => dig(game, 'promotions.promotionalOffers', []).length > 0)
      .map(async (game) => {
        await (new Promise((resolve) => setTimeout(resolve, 500)));
        const variables = encodeURIComponent(JSON.stringify({
          locale: "en-US",
          country: "US",
          offerId: game.id,
          sandboxId: game.namespace
        }));
        const extensions = encodeURIComponent(JSON.stringify({
          persistedQuery: {
            version: 1,
            sha256Hash: "6797fe39bfac0e6ea1c5fce0ecbff58684157595fee77e446b4254ec45ee2dcb"
          }
        }));
        const detailsUrl = `https://store.epicgames.com/graphql?operationName=getCatalogOffer&variables=${variables}&extensions=${extensions}`;
        let details = {};
        try {
          const detailsRequest = await fetch(detailsUrl, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/116.0',
            }
          });
          details = await detailsRequest.text();
          console.log('[details]', detailsUrl, details.slice(0, 64) + '...');
          details = JSON.parse(details);
        } catch (err) {
          console.error('unable to get product details', err);
          details = {};
        }
        const tags = dig(details, 'data.Catalog.catalogOffer.tags', []);
        const genres = tags.filter(t => t.groupName === 'genre').map(t => t.name);
        const platforms = tags.filter(t => t.groupName === 'platform').map(t => t.name);

        console.log('tags', genres, platforms);

        return {
          image_url: dig(game.keyImages.find(img => imageTypes.includes(img.type)), 'url', config('urls.fallback.banner')) + '?h=150&resize=1',
          tags,
          genres,
          platforms,
          slug: dig(game, 'offerMappings.0.pageSlug', dig(game, 'urlSlug')),
          title: game.title,
          description: game.description,
        };
      })
  )
  .catch((err) => {
    console.error('unable to transform game data', err);
    return [];
  });

/*

https://store.epicgames.com/graphql?operationName=getCatalogOffer&variables={"locale":"en-US","country":"CA","offerId":"45b82cb4454b40439b61ba126adfabec","sandboxId":"80d3aeb1d7c3434981e0bcbc47700a83"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"6797fe39bfac0e6ea1c5fce0ecbff58684157595fee77e446b4254ec45ee2dcb"}}
https://store.epicgames.com/graphql?operationName=getCatalogOffer&variables={"locale":"en-US","country":"CA","offerId":"${game.id}","sandboxId":"${game.namespace}"}&extensions={"persistedQuery":{"version":1,"sha256Hash":"6797fe39bfac0e6ea1c5fce0ecbff58684157595fee77e446b4254ec45ee2dcb"}}

*/


export const toSlackBlocks = (payload) => {
  return data(payload)
    .then((games) => {
      return games.map((game) => {
        return [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${game.title}* - ${game.description}`,
            },
            accessory: {
              type: "image",
              image_url: game.image_url,
              alt_text: `${game.name} product logo`,
            }
          },
          // {
          //   type: "image",
          //   image_url: game.image_url,
          //   alt_text: `${game.title} poster image`,
          // },
          // {
          //   type: "section",
          //   text: {
          //     type: "mrkdwn",
          //     text: `*${game.title}* -  ${game.description}`,
          //   }
          // },
          (game.genres.length > 0) && (game.platforms.length > 0) && {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": `*Genres*: ${game.genres.join(', ')} | *Platforms*: ${game.platforms.join(', ')}`
              }
            ]
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: 'Store Page',
                },
                url: `${config('urls.epicBase')}/p/${game.slug}`,
              }
            ]
          },
          //{ type: 'divider' },
        ].filter(Boolean);
      });
    });
}
