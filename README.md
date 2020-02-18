# cars test api

This is a [Zeit](https://zeit.co/) application to provide a RESTFul interface for manipulating 'cars'.

It is to provide an API for this test: https://github.com/ecsdigital/cars-react-test

Currently deployed to https://cars-test-service.now.sh

## getting started

Have nodejs 10+ installed.

You will need to initialise zeit for your environment:

```
npm install -g now
now init
```

Once you have a name for the app, you will be able to deploy and use the api.

## api

Prod:

https://YOURAPPNAME.now.sh/api/car

Test:

https://YOURAPPNAME.YOURUSERNAME.now.sh/api/car

Details: https://github.com/ecsdigital/cars-react-test/blob/master/README.md

State is stored against https://api.myjson.com/bins/1e0udg (a free, stateful JSON API).

It's possible that API will break or that the quantity of data in there will grow too large to be effective 
(it's not currently clearing any data from any test)...
these are risks I'm willing to take for now.

### auth

The API has arbitrary authentication just to test the candidates ability to apply it.

On each request will need to send authentication in the header:

A cURL example:

```curl -H 'authorization: Bearer NAME.supersecretecstoken' https://cars-test-service.now.sh/api/car```

`NAME` can/should be replaced with any a-z string but `supersecretecstoken` must be exactly that.

## deploy

local:
```now dev```

test:
```now```

prod:
```now --prod```

## TODO

 * Write tests
 * Use a more reliable backend
 * Clear out the backend data regularly (nightly?)
 * Put config values into .env or similar (currently hard coded)
 * Make the deployment ECS specific (rather than deployed using sam.adams@ecs-digital.co.uk's zeit account)
   * might require moving from Zeit or paying for it
   * if we change the url of the api we need to update the react test
