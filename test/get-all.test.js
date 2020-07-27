const { validAuthHeaders } = require('./utils');

const tap = require('tap');
const nock = require('nock');
const { JSONBIN_BASE_URL, JSONBIN_BIN_PATH, createStubResponse } = require('./utils');
const handler = require('../api/car');

tap.test('gets correct user data', async t => {
  const scope = nock(JSONBIN_BASE_URL)
    .get(JSONBIN_BIN_PATH)
    .reply(200, {
      bob: {
        timestamp: new Date().getTime(),
        cars: [{ something: 'carlike' }],
      },
      bill: {
        timestamp: new Date().getTime(),
        cars: [{ something: 'carlike2' }],
      },
    });
  const res = createStubResponse();
  await handler(
    {
      headers: validAuthHeaders('bob'),
      method: 'get',
    },
    res,
  );
  scope.done();
  t.same(res._json, [{ something: 'carlike' }]);
  t.equal(res._status, 200);

  t.end();
});
