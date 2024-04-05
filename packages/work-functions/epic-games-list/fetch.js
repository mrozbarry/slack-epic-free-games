import nodeFetch from 'node-fetch';

export const fetch = (url, params = {}) => {
  console.log(`[fetch] ${params.method || 'GET'} ${url}`);
  return nodeFetch(url, params);
};
