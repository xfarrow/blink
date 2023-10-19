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
      return res.status(400).json({ error : "Some or all required fields are missing"});
    }

    if(!validateEmail(req.body.email)){
      return res.status(400).json({ error : "The email is not in a valid format"});
    }

    // Generate activation link token
    const activationLink = crypto.randomBytes(16).toString('hex');

    // Hash provided password
    const hashPasswordPromise = bcrypt.hash(req.body.password, 10);

    try{
        // Begin transaction. We need to insert both in the "Person" table
        // and in the "ActivationLink" one.
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
      console.error('Error registering person:', error);
      res.status(500).json({error : "Internal server error"});
    }
}

// POST
async function login(req, res){

  // Ensure that the required fields are present before proceeding
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({error : "Invalid request"});
  }

  const person = await checkUserCredentials(req.body.email, req.body.password);

  if (person){
    const token = generateToken(person.id);
    res.status(200).json({ token });
  }
  else{ 
    res.status(401).json({error : "Unauthorized"});
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
        delete user['password']; // remove password field for security reasons
        return res.status(200).send(user);
      }
    }
    return res.status(404).json({error: "Not found"});
  }
  catch (error) {
    console.log("Error while getting person: " + error);
    return res.status(500).json({error : "Internal server error"});
  }
}

// GET
async function deletePerson(req, res) {
  // A user can only delete themselves
  try {
    await knex('Person')
      .where({id : req.jwt.person_id})
      .del();
    return res.status(200).json({success: true});
  } catch (error) {
    console.log("Error deleting a Person: " + error);
    return res.status(500).json({error : "Internal server error"});
  }
}

// POST
async function createOrganization(req, res){
  
  // Ensure that the required fields are present before proceeding
  if (!req.body.name) {
    return res.status(400).json({ error : "Invalid request"});
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
    console.error('Error creating Organization:', error);
    res.status(500).json({error : "Internal server error"});
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
      return res.status(200).json({success: true});
    }
    return res.status(403).json({ error : "Forbidden" });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({error : "Internal server error"});
  }
}

// POST
async function createOrganizationPost(req, res){
  
  // Ensure that the required fields are present before proceeding
  if (!req.body.organization_id || !req.body.content) {
    return res.status(400).json({ error : "Invalid request"});
  }

  try {
    if (await isPersonOrganizationAdmin(req.jwt.person_id, req.body.organization_id)){
      const organizationPost = await knex('OrganizationPost')
        .insert({
          organization_id: req.body.organization_id,
          content: req.body.content,
          original_author: req.jwt.person_id
        })
        .returning('*');
        return res.status(200).json(organizationPost[0]);
    }
    else{
      return res.status(401).json({ error : "Forbidden"});
    }
  } 
  catch (error) {
    console.log(error);
    return res.status(500).json({error : "Internal server error"});
  }
}

// GET
async function getOrganization(req, res){
  const organizationId = req.params.id;
  try {
    const organization = await knex('Organization')
      .where('id', organizationId)
      .select('*')
      .first();
    if(organization) {
      return res.status(200).json(organization);
    }
    else{
      return res.status(404).json({error : "Not found"});
    }
  }
  catch (error) {
    console.error("Error retrieving an organization: " + error);
    return res.status(500).json({error : "Internal server error"});
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
          return res.status(200).json({success: true});
        } 
        else {
          return res.status(401).json({error : "Forbidden"});
        }
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({error : "Internal server error"});
  }
}

// POST
async function addOrganizationAdmin(req, res){

  // Ensure that the required fields are present before proceeding
  if (!req.body.organization_id || !req.body.person_id) {
    return res.status(400).json({ error : "Invalid request"});
  }  

  try {
    // Here we do not actually need a transaction. Two different queries,
    // one who checks if the user is admin and one to add the user would've
    // been sufficient and non-exploitable, but still it'd have been a
    // TOC/TOU weakness (https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use)
    knex.transaction(async (trx) => {
      // Check if the current user is a organization's administrator
      const result = await trx('OrganizationAdministrator')
        .where('id_person', req.jwt.person_id)
        .where('id_organization', req.body.organization_id)
        .select('*')
        .first();

        if(!result){
          return res.status(401).json({error : "Forbidden"});
        }

        // We suppose that the database has Foreign Key constraints
        await knex('OrganizationAdministrator')
          .insert({
            id_person: req.body.person_id,
            id_organization: req.body.organization_id
          });
        return res.status(200).json({success : true});
    });
  } 
  catch (error) {
    console.error('Error while adding organization admin: ' + error);
    res.status(500).json({error : "Internal server error"});
  }
}

// DELETE
async function removeOrganizationAdmin(req, res){

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

  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { 
    expiresIn: '8h' 
  });
  return token;
}

// Middlware
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send({error : 'No token provided'});
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({error : 'Failed to authenticate token'});
    }

    // If the token is valid, store the decoded data in the request object
    req.jwt = decoded;
    next();
  });
}

function validateEmail(email) {
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return regex.test(email);
}

// Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
module.exports = {
    registerPerson,
    login,
    getPerson,
    deletePerson,
    verifyToken,
    createOrganization,
    getOrganization,
    deleteOrganization,
    createOrganizationPost,
    deleteOrganizationPost,
    addOrganizationAdmin,
    removeOrganizationAdmin
};