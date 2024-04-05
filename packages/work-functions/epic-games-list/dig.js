export const dig = (value, keys, fallback) => {
  if (typeof keys === 'string') {
    return dig(value, keys.split('.'), fallback);
  }

  if (keys.length === 0) return value;
  if (value === null || value === undefined) return fallback;

  return keys[0] in value
    ? dig(value[keys[0]], keys.slice(1), fallback)
    : fallback;
};

