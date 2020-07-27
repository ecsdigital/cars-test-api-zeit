const tap = require('tap');
const { createStubResponse } = require('./utils');
const handler = require('../api/car');

tap.test('no auth', async t => {
  const res = createStubResponse();
  await handler(
    {
      headers: {
        // no auth header
      },
    },
    res,
  );
  t.same(res._json, { error: "Unauthorized: Missing 'authorization' header" });
  t.equal(res._status, 401);
  t.end();
});

tap.test('missing bearer', async t => {
  const res = createStubResponse();
  await handler(
    {
      headers: {
        authorization: 'missing',
      },
    },
    res,
  );
  t.same(res._json, { error: 'Bad Request: Bad authorization header value (no bearer)' });
  t.equal(res._status, 400);
  t.end();
});

tap.test('invalid bearer', async t => {
  const res = createStubResponse();
  await handler(
    {
      headers: {
        authorization: 'Bearer name.notcorrectsecret',
      },
    },
    res,
  );
  t.same(res._json, { error: 'Forbidden: Not allowed' });
  t.equal(res._status, 403);
  t.end();
});
