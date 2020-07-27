const { httpErrorHandler } = require('../../lib/utils');
const { authenticate } = require('../../lib/authenticate');
const data = require('../../lib/store');

module.exports = async (req, res) => {
  await httpErrorHandler(res, async () => {
    const user = authenticate(req.headers);
    const { method, body, query } = req;
    console.log(`Incoming request from user "${user}": ${JSON.stringify({ method, body, query })}`);
    const { car: carId } = query;

    switch (method.toLowerCase()) {
      case 'put':
        console.log(`User ${user} -> Updating ${carId}: ${JSON.stringify(body)}`);
        res.status(200).json(await data.update(user, body, carId));
        break;
      case 'delete':
        console.log(`User ${user} -> Deleting ${carId}`);
        await data.remove(user, carId);
        res.status(204).send();
        break;
      case 'get':
        console.log(`User ${user} -> getting one car ${carId}`);
        res.status(200).json(await data.getOne(user, carId));
        break;
      default:
        console.log(`User ${user} -> Invalid method: ${method}`);
        res.status(405).json({ error: 'Method Not Allowed' });
    }
  });
};
