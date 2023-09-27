/*
**  This code is part of Blinklink
**  licensed under GPLv3
*/

const express = require('express');
const app = express();
const port = 3000;

// Middleware which parses JSON for POST requests
app.use(express.json());

// Sample data (an array of items)
const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
];

// Define a route to get all items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// POST - Register an account
app.post('/api/register', (req, res) => {
  const User = req.body;
  res.status(200).json(User);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});