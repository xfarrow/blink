/*
**  This code is part of Blink
**  licensed under GPLv3
*/

// require() always returns a function
const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const crypto = require('crypto');

// We can do express() because the express
// module exports a function. Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
const app = express();
const port = 3000;

// Middleware which parses JSON for POST requests
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Blink',
  password: 'postgres',
  port: 5432,
  max: 10, 
  idleTimeoutMillis: 30000,
});

// Define a route to get all items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// POST - Register an account
app.post('/api/register', (req, res) => {
  const userData = req.body;
  
  // Ensure that the required fields are present before proceeding
  if (!userData.display_name || !userData.email || !userData.password) {
    return res.status(400).json("Invalid request");
  }

  bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
    
    if (err) {
      console.error('Error hashing password:', err);
    }

    else {

      // Generate activation link token
      const activationLink = crypto.randomBytes(16).toString('hex');

      // Acquire a connection from the pool
      pool.connect()
      .then((client) => {
        // SQL query with placeholders for parameters
        const insertQuery = `
        INSERT INTO "User" (display_name, date_of_birth, place_of_living, is_looking_for_job, email, password)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`; // Return the inserted row

      return client.query(insertQuery, [
        userData.display_name,
        userData.date_of_birth,
        userData.place_of_living,
        userData.is_looking_for_job,
        userData.email,
        hashedPassword
      ])
      .then((result) => {
        // Respond with the inserted user data
        res.status(200).json(result.rows[0]);
      })
      .catch((error) => {
        console.error('Error inserting data:', error);
        res.status(500).json("Internal server error");
      })
      .finally(() => {
        // Release the connection back to the pool
        client.release();
      });
    })
    .catch((error) => {
      console.error('Error acquiring a connection from the pool:', error);
      res.status(500).json("Internal server error");
    });
    }

  });
});

// Start the server
app.listen(port, () => {
  console.log(`Blink API server is running on port ${port}`);
});