const { authenticate } = require('../../lib/authenticate');
const data = require('../../lib/store');
const { httpErrorHandler } = require('../../lib/utils');

module.exports = async (req, res) => {
  await httpErrorHandler(res, async () => {
    const user = authenticate(req.headers);
    const { method, body } = req;
    console.log(`Incoming request from user "${user}": ${JSON.stringify({ method, body })}`);
    switch (method.toLowerCase()) {
      case 'post':
        console.log(`User ${user} -> Creating: ${JSON.stringify(body)}`);
        res.status(200).json(await data.create(user, body));
        break;
      case 'get':
        console.log(`User ${user} -> getting all cars`);
        res.status(200).json(await data.getAll(user));
        break;
      default:
        console.log(`User ${user} -> Invalid method: ${method}`);
        res.status(405).json({ error: 'Method Not Allowed' });
    }
  });
};
