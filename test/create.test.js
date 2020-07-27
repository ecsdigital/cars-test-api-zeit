const { validAuthHeaders } = require('./utils');

const tap = require('tap');
const nock = require('nock');
const { JSONBIN_BASE_URL, JSONBIN_BIN_PATH, createStubResponse } = require('./utils');
const handler = require('../api/car');

async function makeValidRequest(username, body) {
  const res = createStubResponse();
  await handler(
    {
      headers: validAuthHeaders(username),
      method: 'post',
      body,
    },
    res,
  );
  return res;
}

tap.test('creates car (has existing cars)', async t => {
  const bobNewCar = { something: 'bobcar2' };
  const scope = nock(JSONBIN_BASE_URL);
  const bill = {
    timestamp: new Date().getTime(),
    cars: [{ something: 'billcar1' }, { something: 'billcar2' }],
  };
  const bob = {
    timestamp: new Date().getTime(),
    cars: [{ something: 'bobcar1' }],
  };
  scope.get(JSONBIN_BIN_PATH).matchHeader('secret-key', process.env.JSONBIN_SECRET).reply(200, {
    bill,
    bob,
  });
  scope
    .put(JSONBIN_BIN_PATH, data => {
      t.equal(data.bob.cars[0].something, 'bobcar1');
      t.equal(data.bob.cars[1].something, 'bobcar2');
      t.equal(data.bob.cars.length, 2);
      const reasonableTimestamp = new Date().getTime() - 100;
      t.ok(
        data.bob.timestamp > reasonableTimestamp,
        `${data.bob.timestamp} !> ${reasonableTimestamp}`,
      );
      t.same(data.bill, bill);
      return true;
    })
    .matchHeader('secret-key', process.env.JSONBIN_SECRET)
    .reply(200, {});
  const res = await makeValidRequest('bob', bobNewCar);
  scope.done();
  t.same(res._json.something, 'bobcar2');
  t.matches(res._json.id, /\w{9}/);
  t.equal(res._status, 200);

  t.end();
});

tap.test('creates car (no existing cars for user)', async t => {
  const bobNewCar = { something: 'bobcar1' };
  const scope = nock(JSONBIN_BASE_URL);
  const bill = {
    timestamp: new Date().getTime(),
    cars: [{ something: 'billcar1' }, { something: 'billcar2' }],
  };
  scope.get(JSONBIN_BIN_PATH).reply(200, {
    bill,
  });
  scope
    .put(JSONBIN_BIN_PATH, data => {
      t.equal(data.bob.cars[0].something, 'bobcar1');
      t.equal(data.bob.cars.length, 1);
      t.same(data.bill, bill);
      return true;
    })
    .reply(200, {});
  const res = await makeValidRequest('bob', bobNewCar);
  scope.done();
  t.same(res._json.something, 'bobcar1');
  t.matches(res._json.id, /\w{9}/);
  t.equal(res._status, 200);

  t.end();
});

tap.test('creates car (removes old user)', async t => {
  const scope = nock(JSONBIN_BASE_URL);
  const timestampOlderThanThreshold =
    new Date().getTime() - (process.env.DATA_RETENTION_THRESHOLD_MS + 1);
  const bill = {
    timestamp: timestampOlderThanThreshold,
    cars: [{ something: 'billcar1' }, { something: 'billcar2' }],
  };
  const ben = {
    timestamp: timestampOlderThanThreshold,
    cars: [{ something: 'bencar1' }],
  };
  scope.get(JSONBIN_BIN_PATH).reply(200, {
    bill,
    ben,
  });
  scope
    .put(JSONBIN_BIN_PATH, data => {
      t.ok(!data.bill);
      t.ok(!!data.ben);
      return true;
    })
    .reply(200, {});

  const res = await makeValidRequest('ben', { something: 'bencar2' });

  scope.done();
  t.equal(res._status, 200);

  t.end();
});
