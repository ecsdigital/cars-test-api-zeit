const { validAuthHeaders } = require('./utils');

const tap = require('tap');
const nock = require('nock');
const { JSONBIN_BASE_URL, JSONBIN_BIN_PATH, createStubResponse } = require('./utils');
const handler = require('../api/car/[car]');

async function makeValidRequest(username, query) {
  const res = createStubResponse();
  await handler(
    {
      headers: validAuthHeaders(username),
      method: 'delete',
      query,
    },
    res,
  );
  return res;
}

tap.test('remove car', async t => {
  const scope = nock(JSONBIN_BASE_URL);
  const bill = {
    timestamp: new Date().getTime(),
    cars: [
      { id: 'a', something: 'billcar1' },
      { id: 'b', something: 'billcar2' },
    ],
  };
  const bob = {
    timestamp: new Date().getTime(),
    cars: [{ id: 'a', something: 'bobcar1' }],
  };
  scope.get(JSONBIN_BIN_PATH).matchHeader('secret-key', process.env.JSONBIN_SECRET).reply(200, {
    bill,
    bob,
  });
  scope
    .put(JSONBIN_BIN_PATH, data => {
      t.same(data.bill.cars, [{ id: 'b', something: 'billcar2' }]);
      t.same(data.bob.cars, [{ id: 'a', something: 'bobcar1' }]);

      return true;
    })
    .matchHeader('secret-key', process.env.JSONBIN_SECRET)
    .reply(200, {});
  const res = await makeValidRequest('bill', { car: 'a' });
  t.equal(res._status, 204);
  scope.done();

  t.end();
});

tap.test('404', async t => {
  const scope = nock(JSONBIN_BASE_URL);
  const bill = {
    timestamp: new Date().getTime(),
    cars: [
      { id: 'a', something: 'billcar1' },
      { id: 'b', something: 'billcar2' },
    ],
  };
  const bob = {
    timestamp: new Date().getTime(),
    cars: [{ id: 'a', something: 'bobcar1' }],
  };
  scope.get(JSONBIN_BIN_PATH).matchHeader('secret-key', process.env.JSONBIN_SECRET).reply(200, {
    bill,
    bob,
  });
  const res = await makeValidRequest('bill', { car: 'nonexistant' });
  t.same(res._json.error, 'Not Found: car not found');
  t.equal(res._status, 404);
  scope.done();

  t.end();
});
