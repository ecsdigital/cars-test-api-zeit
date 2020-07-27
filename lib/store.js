const fetch = require('node-fetch');
const createError = require('http-errors');
const { getConfig } = require('./config');

const generateId = () => Math.random().toString(36).substr(2, 9);

async function resErr(res, url) {
  const resBody = await res.text();
  const msg = `Bad response from ${url}, Res Status: ${res.status}, Res Body: "${resBody}"`;
  console.error(msg);
  return createError(500, msg);
}

const fetchData = async () => {
  const { JSONBIN_URL, JSONBIN_SECRET } = getConfig();
  let res;

  try {
    res = await fetch(JSONBIN_URL, {
      headers: {
        'secret-key': JSONBIN_SECRET,
      },
    });
  } catch (e) {
    throw createError(500, `Unexpected fetch error for ${JSONBIN_URL}: ${e.message}`);
  }
  if (!res.ok) {
    throw await resErr(res, JSONBIN_URL);
  }
  return res.json();
};

const getUserCars = async user => {
  const data = await fetchData();
  return data[user] ? data[user].cars : [];
};

const setData = async data => {
  const nowTime = new Date().getTime();
  const { JSONBIN_URL, JSONBIN_SECRET, DATA_RETENTION_THRESHOLD_MS } = getConfig();
  const threshold = nowTime - DATA_RETENTION_THRESHOLD_MS;
  for (const [user, userData] of Object.entries(data)) {
    if (userData.timestamp < threshold) {
      console.log(`removing entry for ${user}`);
      delete data[user];
    }
  }
  const body = JSON.stringify(data);

  let res;
  try {
    res = await fetch(JSONBIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'secret-key': JSONBIN_SECRET,
        versioning: 'false',
      },
      body,
    });
  } catch (e) {
    throw createError(500, `Unexpected fetch error for ${JSONBIN_URL}: ${e.message}`);
  }
  if (!res.ok) {
    throw await resErr(res, JSONBIN_URL);
  }

  return res.json();
};

async function getUserCarOrFail(user, carId) {
  const cars = await getUserCars(user);
  const car = cars.find(c => c.id === carId);
  if (!car) {
    throw createError(404, 'Not Found: car not found');
  }
  return car;
}

module.exports = {
  update: async (user, updateCar, id) => {
    const existingData = await fetchData();
    const cars = existingData[user] ? existingData[user].cars : [];
    const car = cars.find(c => c.id === id);
    if (!car) {
      throw createError(404, 'Not Found: car not found');
    }
    Object.assign(car, updateCar);
    existingData[user] = { cars, timestamp: new Date().getTime() };
    await setData(existingData);
    return car;
  },
  getAll: user => {
    return getUserCars(user);
  },
  getOne: (user, id) => {
    return getUserCarOrFail(user, id);
  },
  create: async (user, car) => {
    const carId = generateId();
    const existingData = await fetchData();
    const cars = existingData[user] ? existingData[user].cars : [];
    Object.assign(car, { id: carId });
    cars.push(car);
    existingData[user] = { cars, timestamp: new Date().getTime() };
    await setData(existingData);
    return car;
  },
  remove: async (user, id) => {
    const existingData = await fetchData();
    const cars = existingData[user] ? existingData[user].cars : [];
    const carIndex = cars.findIndex(c => c.id === id);
    if (carIndex === -1) {
      throw createError(404, 'Not Found: car not found');
    }
    cars.splice(carIndex, 1);
    existingData[user] = { cars, timestamp: new Date().getTime() };
    await setData(existingData);
  },
};
