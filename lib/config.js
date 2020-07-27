const TWO_DAYS_MS = 1.728e8;

function getConfig() {
  const DATA_RETENTION_THRESHOLD_MS =
    Number(process.env.DATA_RETENTION_THRESHOLD_MS || 0) || TWO_DAYS_MS;
  const AUTH_SECRET = process.env.AUTH_SECRET;
  const JSONBIN_ID = process.env.JSONBIN_ID;
  const JSONBIN_SECRET = process.env.JSONBIN_SECRET;
  const JSONBIN_URL = `https://api.jsonbin.io/b/${JSONBIN_ID}`;

  if (!JSONBIN_ID) {
    throw new Error('Missing env var JSONBIN_ID');
  }
  if (!JSONBIN_SECRET) {
    throw new Error('Missing env var JSONBIN_SECRET');
  }
  if (!AUTH_SECRET) {
    throw new Error('Missing env var AUTH_SECRET');
  }
  return {
    AUTH_SECRET,
    JSONBIN_URL,
    JSONBIN_SECRET,
    JSONBIN_ID,
    DATA_RETENTION_THRESHOLD_MS,
  };
}

module.exports = { getConfig };
