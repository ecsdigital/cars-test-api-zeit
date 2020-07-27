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
      method: 'get',
      query,
    },
    res,
  );
  return res;
}

tap.test('get one car', async t => {
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
  const res = await makeValidRequest('bill', { car: 'a' });
  scope.done();
  t.same(res._json.something, 'billcar1');
  t.matches(res._json.id, 'a');
  t.equal(res._status, 200);

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

tap.test('JSONBin 504', async t => {
  const scope = nock(JSONBIN_BASE_URL);
  scope.get(JSONBIN_BIN_PATH).matchHeader('secret-key', process.env.JSONBIN_SECRET).reply(504);
  const res = await makeValidRequest('bill', { car: 'doesntmatter' });
  t.same(res._json.error, 'Internal Server Error');
  t.equal(res._status, 500);
  scope.done();

  t.end();
});

tap.test('JSONBin connection fail', async t => {
  const scope = nock(JSONBIN_BASE_URL);
  scope
    .get(JSONBIN_BIN_PATH)
    .matchHeader('secret-key', process.env.JSONBIN_SECRET)
    .replyWithError(new Error('low level error eg connect error'));
  const res = await makeValidRequest('bill', { car: 'doesntmatter' });
  t.same(res._json.error, 'Internal Server Error');
  t.equal(res._status, 500);
  scope.done();

  t.end();
});
