const fetch = require('node-fetch');

const url = 'https://api.myjson.com/bins/1e0udg';

const generateId = () => Math.random().toString(36).substr(2, 9);

const fetchData = async () => {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failure saving data: ${await response.clone().text()}`)
  }
  return response.json();
};

const getUserCars = async (user) => {
  const data = await fetchData();
  return data[user] || [];
};

const setUserCars = async (user, cars) => {
  const existingData = await fetchData();
  existingData[user] = cars;
  const body = JSON.stringify(existingData);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body,
  });
  if (!response.ok) {
    console.error(`Failure saving data: ${await response.clone().text()}`)
  }
  return response.json();
};

module.exports = {
  update: async (user, data, id) => {
    const cars = await getUserCars(user);
    const car = cars.find(c => c.id = id);
    Object.assign(car, data);
    await setUserCars(user, cars);
    return car;
  },
  getAll: (user) => {
    return getUserCars(user);
  },
  getOne: async (user, id) => {
    const cars = await getUserCars(user);
    return cars.find(c => c.id = id);
  },
  create: async (user, data) => {
    const carId = generateId();
    const cars = await getUserCars(user);
    const car = {...data, id: carId};
    cars.push(car);
    await setUserCars(user, cars);
    return car;
  },
  remove: async (user, id) => {
    const cars = await getUserCars(user);
    const carIndex = cars.findIndex(c => c.id = id);
    if (carIndex === -1) {
      return false;
    }
    cars.splice(carIndex, 1);
    await setUserCars(user, cars);
    return true;
  },
};
