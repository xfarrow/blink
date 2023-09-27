/*
**  This code is part of Blinklink
**  licensed under GPLv3
*/


const express = require('express');
const app = express();
const port = 3000;

const { Client } = require('pg');

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
  const userData = req.body;
  
  // Ensure that the required fields are present before proceeding
  if (!userData.display_name || !userData.email) {
    return res.status(400).json("Invalid request");
  }

  // Create a PostgreSQL client
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'Blink',
    password: 'postgres',
    port: 5432, // Default PostgreSQL port
  });

  client.connect()
    .then(() => {
      // SQL query with placeholders for parameters
      const insertQuery = `
        INSERT INTO "User" (display_name, date_of_birth, place_of_living, is_looking_for_job, email)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`; // Return the inserted row

      return client.query(insertQuery, [
        userData.display_name,
        userData.date_of_birth,
        userData.place_of_living,
        userData.is_looking_for_job,
        userData.email
      ]);
    })
    .then((result) => {
      // Respond with the inserted user data
      res.status(200).json(result.rows[0]);
    })
    .catch((error) => {
      console.error('Error inserting data:', error);
      res.status(500).json("Internal server error");
    })
    .finally(() => {
      // Close the database connection
      client.end();
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});