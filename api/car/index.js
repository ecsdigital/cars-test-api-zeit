const authenticate = require("./authenticate");
const data = require('./data');

module.exports = async (req, res) => {
  const user = authenticate(req, res);
  if (!user) {
    return;
  }
  const {method, body} = req;
  switch(method.toLowerCase()) {
    case 'post':
      const car = await data.create(user, body);
      console.log(`User ${user} -> Created: ${JSON.stringify(car)}`);
      res.status(200).json(car);
      break;
    case 'get':
      console.log(`User ${user} -> getting all cars`);
      res.status(200).send(await data.getAll(user));
      break;
    default:
      console.log(`User ${user} -> Invalid method: ${method}`);
      res.status(405).json({error: "Method Not Allowed"});
  }
};