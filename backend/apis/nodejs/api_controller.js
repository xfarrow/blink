/*
    This code is part of Blink
    licensed under GPLv3

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
    IMPLIED,  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
    IN THE SOFTWARE.
*/
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pgp = require('pg-promise')();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const database_configuration = {
  host: process.env.POSTGRES_SERVER,
  port: process.env.POSTGRES_PORT,
  database: "Blink",
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD
};
const db = pgp(database_configuration);

// ======== API ENDPOINTS ========

// POST
async function registerPerson(req, res){

    const userData = req.body;
  
    // Ensure that the required fields are present before proceeding
    if (!userData.display_name || !userData.email || !userData.password) {
      return res.status(400).json("Invalid request.");
    }

    // Generate activation link token
    const activationLink = crypto.randomBytes(16).toString('hex');

    // Hash provided password
    const hashPasswordPromise = bcrypt.hash(userData.password, 10);

    try{
        
        // Begin transaction
        await db.tx(async (t) => {
        
          // Inserting in the "Person" table
          const userInsertQuery = `
            INSERT INTO "Person" (email, password, display_name, date_of_birth, available, enabled, place_of_living)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
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
  
          // Inserting in the "ActivationLink" table
          const activationLinkInsertQuery = `
            INSERT INTO "ActivationLink" (person_id, identifier)
            VALUES ($1, $2)
            RETURNING *`;
  
          const activationLinkResult = await t.one(activationLinkInsertQuery, [
            userResult.id,  
            activationLink,
          ]);

          return res.status(200).json({ activationLink: activationLinkResult.identifier });

      });
    }
    catch (error){
      console.error('Error inserting data:', error);
      res.status(500).json("Internal server error");
    }
}

// POST
async function login(req, res){
  
  const userData = req.body;
      
  // Ensure that the required fields are present before proceeding
  if (!userData.email || !userData.password) {
    return res.status(400).json("Invalid request");
  }

  const person = await checkUserCredentials(userData.email, userData.password);

  if (person){
    const token = generateToken(person.id);
    res.status(200).json({ token });
  }
  else{ 
    res.status(401).json("Unauthorized");
  }
}

// GET
async function getPerson(req, res){
  try {
    const user = await db.oneOrNone('SELECT * FROM "Person" WHERE id = $1 and enabled = $2' , [req.params.id, false]);
    
    if(user){
      if(user.id == req.jwt.person_id || user.active == true){
        return res.status(200).send(user);
      }
    }
    return res.status(403);
  }
  catch (error) {
    console.log(error);
    return res.status(500);
  }
}

// POST
async function createOrganization(req, res){
  const organizationData = req.body;
  
  // Ensure that the required fields are present before proceeding
  if (!organizationData.name) {
    return res.status(400).json("Invalid request.");
  }

  try{
        
    // Begin transaction
    await db.tx(async (t) => {
    
      // Inserting in the "Organization" table
      const OrganizationInsertQuery = `
        INSERT INTO "Organization" (name, location, description, is_hiring)
        VALUES ($1, $2, $3, $4)
        RETURNING *`;

      const organizationResult = await t.one(OrganizationInsertQuery, [
        organizationData.name,
        organizationData.location,
        organizationData.description,
        organizationData.is_hiring
      ]);

      // Inserting in the "OrganizationAdministrator" table
      const OrganizationAdministratorInsertQuery = `
        INSERT INTO "OrganizationAdministrator" (id_person, id_organization)
        VALUES ($1, $2)`;

      await t.none(OrganizationAdministratorInsertQuery, [
        req.jwt.person_id,
        organizationResult.id
      ]);

      return res.status(200).json({ "Organization" : organizationResult});

    });
  }
  catch (error){
    console.error('Error inserting data:', error);
    res.status(500).json("Internal server error");
  }
}

// DELETE
async function deleteOrganization(req, res){
  const organizationIdToDelete = req.params.id;

  try {
    if(await isPersonOrganizationAdmin(req.jwt.person_id, organizationIdToDelete)){
      await db.none('DELETE FROM "Organization" WHERE id = $1', [organizationIdToDelete]);
      return res.status(200).json("Ok");
    }
    return res.status(403).json("Forbidden");
  }
  catch (error) {
    console.error(error);
    return res.status(500);
  }
}

// ======== END API ENDPOINTS ========

async function checkUserCredentials(email, password){
  try {
    const user = await db.oneOrNone('SELECT * FROM "Person" WHERE email = $1 and enabled = $2', [email, true]);
    if(user){
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (passwordMatches) {
        return user;
      }
    }
    return null;
  }
  catch (error) {
    console.log(error);
    return null;
  }
}

async function isPersonOrganizationAdmin(personId, organizationId){
  try {
    if(await db.oneOrNone('SELECT * FROM "OrganizationAdministrator" WHERE id_person = $1 AND id_organization = $2', [personId, organizationId])){
      return true;
    }
    return false;
  }
  catch (error) {
    return false;
  }
}

function generateToken(person_id) {
  const payload = {
    person_id: person_id
  };

  const token = jwt.sign(payload, 'your-secret-key', { expiresIn: '1h' });
  return token;
}

// Middlware
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).send('No token provided');
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).send('Failed to authenticate token');
    }

    // If the token is valid, store the decoded data in the request object
    req.jwt = decoded;
    next();
  });
}

// Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
module.exports = {
    registerPerson,
    login,
    getPerson,
    verifyToken,
    createOrganization,
    deleteOrganization
};