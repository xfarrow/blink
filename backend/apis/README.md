# APIs

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

## For Developers
The current implementation of the Blink APIs is written in NodeJS. Feel free to develop them in any other
programming language (you can paste the folder here) but make sure to make them compatible with one another
and please follow the API design [best practices](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)
