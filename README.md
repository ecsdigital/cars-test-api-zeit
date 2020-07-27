# cars test api

This is a [Vercel](https://vercel.com/) (formerly [Zeit](https://zeit.co/)) application to provide a RESTFul interface for manipulating 'cars'.

It is to provide an API for this test: https://github.com/ecsdigital/cars-react-test

Currently, deployed to https://cars-test-service.now.sh

## now/zeit/vercel?

Chosen because it's simple and free to deploy.

It takes a bit of getting used to because the file names are meaningful (a bit too magic really). 
E.g. 
 - `/api/car/[car].js` -> `/api/car/SOMECARID` (`{car:"SOMECARID"}` gets pass in the query property of the request object in the handler). 
 - `/api/car/index.js` -> `/api/car`. 

## getting started

Optional: It's worth installing [httpie](https://httpie.org/) as examples below use it.

Have nodejs 10+ installed.

You will need to initialise zeit/vercel/now for your environment:

(Note: `now` cli is now (lol) `vercel`, but `now` is an alias)

```
npm install -g now
now init
```

Once you have a name for the app, you will be able to deploy and use the api.

## api

Prod:

https://YOURAPPNAME.now.sh/api/car

Test:

https://YOURAPPNAME.YOURUSERNAME.vercel.app/api/car

Details: https://github.com/ecsdigital/cars-react-test/blob/master/README.md

### state

For laziness (not having to deploy any databases to aws etc), state is stored in [jsonbin](https://jsonbin.io/api-reference).

The state for all users is stored in a single json object/bin. 
We don't imagine a lot of candidates taking the test, 
and we use a data retention threshold to remove data (`DATA_RETENTION_THRESHOLD_MS`), 
so we aren't too worried about this scaling well! 

If you wish to deploy this application you will need a working JSONbin account, a bin id and an secret-key to write to the bin:

1. Create you jsonbin account and get your secret key here: https://jsonbin.io
1. Create a bin: 
    ```bash
    http https://api.jsonbin.io/b any=data private:true 'secret-key:JSONBIN_SECRET'
    ```
1. take note of your bin id:
   ```json
   {
       "data": {
           "any": "data"
       },
       "id": "JSONBIN_ID",
       "private": true,
       "success": true
   }
   ```
1. check you can get the data back:
    ```bash
    http https://api.jsonbin.io/b/JSONBIN_ID 'secret-key:JSONBIN_SECRET'
    ```

You will need these values in your config...

### config

Locally, config is set in a (git ignored) `.env` file:

    JSONBIN_SECRET=foo
    JSONBIN_ID=foo
    AUTH_SECRET=supersecretecstoken

... but when deploying to test/production it's managed by `vercel`.

This is how you add the secrets to `vercel`:

    now secret add jsonbin-id JSONBIN_ID
    now secret add jsonbin-secret JSONBIN_SECRET
    now secret add cars-auth-secret AUTH_SECRET

The secrets are bound to env vars at runtime through `now.json`.

The string in `cars-auth-secret` will be used in our (very simplistic) auth below:

### auth

The API has arbitrary authentication just to test the candidates ability to apply it.

Each request will need to send authentication in the header:

A cURL example:

```bash
http https://cars-test-service.now.sh/api/car 'authorization: Bearer NAME.AUTH_SECRET'
```

`NAME` can/should be replaced with any a-z string (ideally a name).
`AUTH_SECRET` must match the value set in the env vars when deploying the application.

## deploy

local:

```now dev```

test:

```now```

prod:

```now --prod```

## TODO

 * Use a better backend (mysql/mongo etc)
 * Deploy to a 'proper' platform (rather than vercel)
 * Make the deployment ECS specific (rather than deployed using sam.adams@ecs-digital.co.uk's zeit account)
   * might require moving from Zeit or paying for it
   * if we change the url of the api we need to update the react test
