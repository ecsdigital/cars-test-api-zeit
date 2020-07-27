async function httpErrorHandler(res, handler) {
  try {
    await handler();
  } catch (err) {
    if (err.status && err.expose) {
      console.debug(`Error response: ${err}`);
      res.status(err.status).json({ error: err.message });
    } else if (err.status) {
      console.log(`Unexposed error: ${err}`);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      throw err;
    }
  }
}

module.exports = { httpErrorHandler };
