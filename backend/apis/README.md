# APIs

## Programming language
The Blink APIs are currently written in NodeJS only.

## Prerequisites
* PostgreSQL;
* NodeJS.

## Deploying
In order to deploy the Blink APIs, follow these steps:
* Configure the `.env` file in `./nodejs/src/`.
* Run `node ./nodejs/src/app.js`

## Testing the APIs
You can test the APIs in two ways:
* Open `BlinkApiUsageExample.json` with Insomnia or Bruno in order to have the collection of APIs already configured and ready to be seen in action;
* Run `npm test` in `./nodejs` to run a suite of automated tests.
