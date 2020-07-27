const { validAuthHeaders } = require('./utils');

const tap = require('tap');
const nock = require('nock');
const { JSONBIN_BASE_URL, JSONBIN_BIN_PATH, createStubResponse } = require('./utils');
const handler = require('../api/car/[car]');

async function makeValidRequest(username, body, query) {
  const res = createStubResponse();
  await handler(
    {
      headers: validAuthHeaders(username),
      method: 'put',
      body,
      query,
    },
    res,
  );
  return res;
}

tap.test('updates car (has existing cars)', async t => {
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
      t.same(data.bill.cars, [
        { id: 'a', something: 'changes', somethin: 'new' },
        { id: 'b', something: 'billcar2' },
      ]);
      t.same(data.bob.cars, [{ id: 'a', something: 'bobcar1' }]);

      return true;
    })
    .matchHeader('secret-key', process.env.JSONBIN_SECRET)
    .reply(200, {});
  const res = await makeValidRequest(
    'bill',
    { something: 'changes', somethin: 'new' },
    { car: 'a' },
  );
  scope.done();
  t.same(res._json.something, 'changes');
  t.same(res._json.somethin, 'new');
  t.matches(res._json.id, 'a');
  t.equal(res._status, 200);

  t.end();
});
