const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pgp = require('pg-promise')();
const Pool = require('pg-pool');

const dbConfig = {
  host: "localhost",
  port: 5432,
  database: "Blink",
  user: "postgres",
  password: "postgres"
};

// Create a new connection pool
const db = pgp({
  pool: new Pool(dbConfig),
});

function register(req, res){
    const userData = req.body;
  
    // Ensure that the required fields are present before proceeding
    if (!userData.display_name || !userData.email || !userData.password) {
      return res.status(400).json("Invalid request");
    }
  
    // The callback denoted by the arrow function is executed
    // when hash() has finished its execution.
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
}

async function register_async(req, res){
    const userData = req.body;
  
    // Ensure that the required fields are present before proceeding
    if (!userData.display_name || !userData.email || !userData.password) {
      return res.status(400).json("Invalid request");
    }

    // Generate activation link token
    const activationLink = crypto.randomBytes(16).toString('hex');
    const hashPasswordPromise = bcrypt.hash(userData.password, 10);

    try{
        const result = await db.tx(async (t) => {
        
        // Inserting in "Person" table
        const userInsertQuery = `
          INSERT INTO "Person" (email, password, display_name, date_of_birth, available, enabled, place_of_living)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`;
  
        const userResult = await t.one(userInsertQuery, [
          userData.email,
          await hashPasswordPromise,
          userData.display_name,
          userData.date_of_birth,
          userData.available,
          false,
          userData.place_of_living
        ]);
  
        const activationLinkInsertQuery = `
          INSERT INTO "ActivationLink" (user_id, activation_code)
          VALUES ($1, $2)
          RETURNING *`;
  
        const activationLinkResult = await t.one(activationLinkInsertQuery, [
          userResult.id,  
          activationLink,
        ]);
        return res.status(200).json({ user: userResult, activationLink: activationLinkResult });
      });
    }
    catch (error){
      console.error('Error inserting data:', error);
      res.status(500).json("Internal server error");
    }
}

function login(req, res){

}

module.exports = {
    register_async
};