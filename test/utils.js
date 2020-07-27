const nock = require('nock');
nock.disableNetConnect();
process.env = {
  JSONBIN_ID: 'aJsonBinId',
  JSONBIN_SECRET: 'aJsonBinSecret',
  AUTH_SECRET: 'somesecret',
  DATA_RETENTION_THRESHOLD_MS: 200000,
};
const JSONBIN_BASE_URL = 'https://api.jsonbin.io';
const JSONBIN_BIN_PATH = `/b/${process.env.JSONBIN_ID}`;
function createStubResponse() {
  return {
    _status: undefined,
    _json: undefined,
    _sent: undefined,
    status: function (status) {
      this._status = status;
      return this;
    },
    json: function (json) {
      this._json = json;
      return this;
    },
    send: function (data = null) {
      this._sent = data;
      return this;
    },
  };
}

function validAuthHeaders(name) {
  return {
    authorization: `Bearer ${name}.${process.env.AUTH_SECRET}`,
  };
}

module.exports = {
  validAuthHeaders,
  JSONBIN_BASE_URL,
  JSONBIN_BIN_PATH,
  createStubResponse,
};
