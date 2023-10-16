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

require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_SERVER,
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    database: 'Blink'
  }
});
const jwt = require('jsonwebtoken');

// ======== API ENDPOINTS ========

// POST
async function registerPerson(req, res){
  
    if (process.env.ALLOW_USER_REGISTRATION === 'false'){
      return res.status(403).json({error : "Users cannot register on this server"});
    }

    // Ensure that the required fields are present before proceeding
    if (!req.body.display_name || !req.body.email || !req.body.password) {
      return res.status(400).json("Invalid request.");
    }

    // Generate activation link token
    const activationLink = crypto.randomBytes(16).toString('hex');

    // Hash provided password
    const hashPasswordPromise = bcrypt.hash(req.body.password, 10);

    try{
        // Begin transaction
        await knex.transaction(async (tr) => {
          
          const personIdResult = await tr('Person')
            .insert({ 
              email: req.body.email, 
              password: await hashPasswordPromise,
              display_name: req.body.display_name,
              date_of_birth: req.body.date_of_birth,
              available: req.body.available,
              enabled: true,
              place_of_living: req.body.place_of_living
            })
            .returning("id");
  
          await tr('ActivationLink')
            .insert({
              person_id: personIdResult[0].id,
              identifier: activationLink
            });
      });
      return res.status(200).json({ activationLink: activationLink });
    }
    catch (error){
      console.error('Error inserting data:', error);
      res.status(500).json("Internal server error");
    }
}

// POST
async function login(req, res){
  // Ensure that the required fields are present before proceeding
  if (!req.body.email || !req.body.password) {
    return res.status(400).json("Invalid request");
  }

  const person = await checkUserCredentials(req.body.email, req.body.password);

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
    const user = await knex('Person')
      .select('*')
      .where({ id: req.params.id, enabled: true })
      .first();
    
    if(user){
      if(user.id == req.jwt.person_id || user.enabled){
        return res.status(200).send(user);
      }
    }
    return res.status(403).json("Forbidden");
  }
  catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
}

// POST
async function createOrganization(req, res){
  
  // Ensure that the required fields are present before proceeding
  if (!req.body.name) {
    return res.status(400).json("Invalid request.");
  }

  try{
    knex.transaction(async (trx) => {
      const organizationResult = await trx('Organization')
        .insert({
          name: req.body.name,
          location: req.body.location,
          description: req.body.description,
          is_hiring: req.body.is_hiring,
        })
        .returning('*');

      // Inserting in the "OrganizationAdministrator" table
      await trx('OrganizationAdministrator')
        .insert({
          id_person: req.jwt.person_id,
          id_organization: organizationResult[0].id,
        });
          
      await trx.commit();

      return res.status(200).json({ Organization: organizationResult[0] });
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
      await knex('Organization')
        .where({ id: organizationIdToDelete })
        .del();
      return res.status(200).json("Ok");
    }
    return res.status(403).json("Forbidden");
  }
  catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error");
  }
}

// POST
async function createOrganizationPost(req, res){
  
  // Ensure that the required fields are present before proceeding
  if (!req.body.organization_id || !req.body.content) {
    return res.status(400).json("Invalid request.");
  }

  try {
    if (await isPersonOrganizationAdmin(req.jwt.person_id, req.body.organization_id)){
      const organizationPost = await knex('OrganizationPost')
        .insert({
          organization_id: req.body.organization_id,
          content: req.body.content,
        })
        .returning('*');
        return res.status(200).json(organizationPost[0]);
    }
    else{
      return res.status(401).json("Forbidden");
    }
  } 
  catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
}

// DELETE
async function deleteOrganizationPost(req, res){
  const organizationPostIdToDelete = req.params.id;
  try{
    knex.transaction(async (trx) => {
      // Check if user is allowed to delete the post
      const result = await trx('OrganizationPost')
        .join('OrganizationAdministrator', 'OrganizationPost.organization_id', 'OrganizationAdministrator.id_organization')
        .where('OrganizationPost.id', organizationPostIdToDelete)
        .where('OrganizationAdministrator.id_person', req.jwt.person_id)
        .select('*')
        .first();
  
      if (result) {
        await trx('OrganizationPost')
          .where('id', organizationPostIdToDelete)
          .del();
          await trx.commit();
          return res.status(200).json('Ok');
        } else {
          return res.status(401).json('Forbidden');
        }
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).json("Internal server error");
  }
}

// POST [NOT COMPLETE]
async function makeAdmin(req, res){

}

// ======== END API ENDPOINTS ========

async function checkUserCredentials(email, password){
  try {
    const user = await knex('Person')
      .where('email', email)
      .where('enabled', true)
      .select('*')
      .first();

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
    const organizationAdministrator = await knex('OrganizationAdministrator')
      .where('id_person', personId)
      .where('id_organization', organizationId)
      .select('*')
      .first();

    if (organizationAdministrator) {
      return true;
    } 
    else {
      return false;
    }
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
    deleteOrganization,
    createOrganizationPost,
    deleteOrganizationPost,
    makeAdmin
};