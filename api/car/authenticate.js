const authenticate = ({headers, method, body, query}, res) => {
  const {authorization} = headers;
  if (!authorization) {
    console.log('No auth header');
    res.status(401).json({error: "Unauthorized: Missing 'authorization' header"});
    return false;
  }
  const [, token] = authorization.split('Bearer ');
  if (!token) {
    console.log(`No bearer token in auth header: ${authorization}`);
    res.status(400).json({error: "Bad Request: Bad authorization header value"});
    return false;
  }
  const [user, secret] = token.split('.');
  if (!user || !secret) {
    console.log(`Can't parse token: ${token}`);
    res.status(400).json({error: "Bad Request: Bad authorization header value"});
    return false;
  }
  if (secret !== 'supersecretecstoken') {
    console.log(`Invalid secret: ${secret}`);
    res.status(403).json({error: "Forbidden: Not allowed"});
    return false;
  }
  console.log(`Incoming request from user "${user}": ${JSON.stringify({method, body, query})}`);
  return user;
};
module.exports = authenticate;