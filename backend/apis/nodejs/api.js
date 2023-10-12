/*
**  This code is part of Blink
**  licensed under GPLv3
*/

// require() always returns a function
const express = require('express');
const api_controller = require('./api_controller.js');

// We can do express() because the express
// module exports a function. Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
const app = express();
const port = 3000;

// Middleware which parses JSON for POST requests
app.use(express.json());

app.post('/blinkapi/register', api_controller.register_async);

// Start the server
app.listen(port, () => {
  console.log(`Blink API server is running on port ${port}`);
});