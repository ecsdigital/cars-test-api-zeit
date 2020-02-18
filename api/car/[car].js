const authenticate = require("./authenticate");
const data = require('./data');

module.exports = async (req, res) => {
  const user = authenticate(req, res);
  if (!user) {
    return;
  }
  const {method, body, query} = req;
  const {car: carId} = query;
  const car = await data.getOne(user, carId);

  if (!car) {
    return res.status(404).json({error: "Not Found: car not found"});
  }

  switch(method.toLowerCase()) {
    case 'put':
      console.log(`User ${user} -> Updating ${carId}: ${JSON.stringify(body)}`);
      Object.assign(car, body);
      res.status(200).json(await data.update(user, body, carId));
      break;
    case 'delete':
      console.log(`User ${user} -> Deleting ${carId}`);
      await data.remove(user, carId);
      res.status(204).send();
      break;
    case 'get':
      console.log(`User ${user} -> getting one car ${carId}`);
      res.status(200).json(car);
      break;
    default:
      console.log(`User ${user} -> Invalid method: ${method}`);
      res.status(405).json({error: "Method Not Allowed"});
  }

};