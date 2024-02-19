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

// ======== BEGIN API ENDPOINTS ========

/**
 * POST Request
 *
 * Registers a Person
 * 
 * Required field(s): name, email (valid ISO standard), password
 * 
 * @returns The activationlink identifier
 */
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

      // Check whether e-mail exists already (enforced by database constraints)
      const existingUser = await knex('Person')
        .where('email', req.body.email)
        .first();

        if(existingUser){
          return res.status(409).json({ error: "E-mail already in use" });
        }

        // We need to insert either both in the "Person" table
        // and in the "ActivationLink" one, or in neither
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

/**
 * POST Request
 * 
 * Creates a token if the specified email
 * and password are valid.
 * 
 * Required field(s): email, password
 *
 * @returns The token
 */
async function login(req, res){

  // Ensure that the required fields are present before proceeding
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({error : "Invalid request"});
  }

  const person = await checkUserCredentials(req.body.email, req.body.password);

  if (person){
    const token = generateToken(person.id);
    res.status(200).json({token: token });
  }
  else{ 
    res.status(401).json({error : "Unauthorized"});
  }
}

/**
 * Obtain a Person's details if the
 * Person to retrieve is either myself or an
 * enabled Person.
 * 
 * Required field(s): none
 *
 * @returns The Person
 */
async function getPerson(req, res){
  try {
    const user = await knex('Person')
      .select('*')
      .where({ id: req.params.id })
      .first();
    
    if(user){
      // I am retrieving either myself or an enabled user
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

/**
 * 
 * GET Request
 * 
 * Get myself, from the JWT token
 *
 * @returns Person's details
 */
async function getMyself(req, res){
  try{
    const person = await knex('Person')
      .select('*')
      .where({ id: req.jwt.person_id })
      .first();

      if(person){
        delete person['password'];
        return res.status(200).send(person);
      }
      return res.status(404).json({error: "Not found"});
  }
  catch (error){
    console.log("Error while getting myself: " + error);
    return res.status(500).json({error : "Internal server error"});
  }
}

/**
 * PUT request
 * 
 * Updates a Person's details. If some details are
 * not present, they shall be ignored.
 * 
 * Required field(s): none. Both old_password and
 * new_password if updating the password.
 *
 */
async function updatePerson(req, res){
  
  if (req.jwt.person_id != req.params.id){
    return res.status(403).json({ error : "Forbidden"});
  }

  const updatePerson = {};

  if(req.body.display_name){
    updatePerson.display_name = req.body.display_name;
  }

  if(req.body.date_of_birth){
    if(isPostgresDateFormatValid(req.body.date_of_birth)){
      updatePerson.date_of_birth = req.body.date_of_birth;
    }
    else{
      return res.status(400).json({ error : "Date of birth format not valid. Please specify a YYYY-MM-DD date"});
    }
  }

  if(req.body.available){
    updatePerson.available = req.body.available;
  }

  if(req.body.place_of_living){
    updatePerson.place_of_living = req.body.place_of_living;
  }

  // If we are tying to change password, the old password must be provided
  if(req.body.old_password && req.body.new_password){
    const user = await knex('Person')
      .select('password')
      .where({ id: req.jwt.person_id })
      .first();
      const passwordMatches = await bcrypt.compare(req.body.old_password, user.password);
      if(passwordMatches){
        updatePerson.password = await bcrypt.hash(req.body.new_password, 10);
      }
      else{
        return res.status(401).json({ error : "Password verification failed"});
      }
  }

  if (Object.keys(updatePerson).length === 0) {
    return res.status(400).json({ error : "Bad request. No data to update"});
  }

  try {
    await knex('Person')
      .where('id', req.params.id)
      .update(updatePerson);
    return res.status(200).json({ success : "true"});
  }
  catch (error) {
    console.log("Error while updating a Person: " + error);
    return res.status(500).json({ error : "Internal server error"});
  }
}

/**
 * GET Request
 * 
 * Deletes a Person. An user can only delete 
 * themselves.
 * 
 * Required field(s): none
 *
 */
async function deletePerson(req, res) {
  try {
    await knex('Person')
      .where({id : req.jwt.person_id})
      .del();
    return res.status(200).json({success: true});

    // TODO: Delete Organization if this user was its only administrator
  } 
  catch (error) {
    console.log("Error deleting a Person: " + error);
    return res.status(500).json({error : "Internal server error"});
  }
}

/**
 * POST Request
 * 
 * Creates an Organization and its Administrator.
 * 
 * Required field(s): name
 *
 * @returns the inserted organization
 */
async function createOrganization(req, res){
  
  // Ensure that the required fields are present before proceeding
  if (!req.body.name) {
    return res.status(400).json({ error : "Invalid request"});
  }

  try{
    const insertedOrganization = await knex.transaction(async (trx) => {

      // We have to insert either both in Organization and in OrganizationAdministrator
      // or in neither
      const organizationResult = await trx('Organization')
        .insert({
          name: req.body.name,
          location: req.body.location,
          description: req.body.description,
          is_hiring: req.body.is_hiring,
        }, '*');

      // Inserting in the "OrganizationAdministrator" table
      await trx('OrganizationAdministrator')
        .insert({
          id_person: req.jwt.person_id,
          id_organization: organizationResult[0].id,
        });
      return organizationResult[0];
    });
    return res.status(200).json({ Organization: insertedOrganization });
  }
  catch (error){
    console.error('Error creating Organization:', error);
    res.status(500).json({error : "Internal server error"});
  }
}

/**
 * PUT Request
 * Updates an Organization's details
 *
 * Required field(s): none.
 */
async function updateOrganization(req, res){

  const updateOrganization = {};

  if(req.body.name){
    updateOrganization.name = req.body.name;
  }

  if(req.body.location){
    updateOrganization.location = req.body.location;
  }

  if(req.body.description){
    updateOrganization.description = req.body.description;
  }

  if(req.body.is_hiring){
    updateOrganization.is_hiring = req.body.is_hiring;
  }

  if (Object.keys(updateOrganization).length === 0) {
    return res.status(400).json({ error : "Bad request. No data to update"});
  }

  try {

    // // const isOrganizationAdmin = await knex('OrganizationAdministrator')
    // // .where('id_person', req.jwt.person_id)
    // // .where('id_organization', req.params.id)
    // // .select('*')
    // // .first();

    // // // This introduces a Time of check Time of use weakeness
    // // // which could'have been fixed by either
    // // // 1) Using "whereExists", thanks to the "it's easier to ask for
    // // // forgiveness than for permission" padarigm. Or,
    // // // 2) Using a serializable transaction.
    // // //
    // // // The undersigned chose not to follow these approaches because
    // // // this does not introduces any serious vulnerability. In this
    // // // way it seems more readable.

    // // if(!isOrganizationAdmin){
    // //   return res.status(403).json({error : "Forbidden"});
    // // }

    // // await knex('Organization')
    // // .where('id', req.params.id)
    // // .update({
    // //   name: req.body.name,
    // //   location: req.body.location,
    // //   description: req.body.description,
    // //   is_hiring: req.body.is_hiring
    // // });

    const updatedRows = await knex('Organization')
    .where('id', req.params.id)
    .whereExists(function(){
      this.select('*')
        .from('OrganizationAdministrator')
        .where('id_person', req.jwt.person_id)
        .where('id_organization', req.params.id)
    })
    .update({
      name: req.body.name,
      location: req.body.location,
      description: req.body.description,
      is_hiring: req.body.is_hiring
    });

    if(updatedRows == 1){
      return res.status(200).json({ success : "true"});
    }
    else{
      return res.status(404).json({error : "Organization either not found or insufficient permissions"});
    }
  } 
  catch (error) {
    console.log(error);
    return res.status(500).json({error : "Internal server error"});
  }
}

/**
 * DELETE Request
 * 
 * Deletes the specified organization if the logged user is
 * one of its administrator 
 */
async function deleteOrganization(req, res){
  const organizationIdToDelete = req.params.id;

  try {

    const isOrganizationAdmin = await knex('OrganizationAdministrator')
      .where('id_person', req.jwt.person_id)
      .where('id_organization', organizationIdToDelete)
      .select('*')
      .first();

    // Potential TOCTOU weakeness not to be worried about
    if(!isOrganizationAdmin){
      return res.status(403).json({error : "Forbidden"});
    }

    await knex('Organization')
      .where({ id: organizationIdToDelete })
      .del();

    return res.status(200).json({success: true});
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({error : "Internal server error"});
  }
}

/**
 * POST Request
 * 
 * Creates a Post belonging to an organization
 *
 * Required field(s): organization_id, content
 * @returns the inserted Post 
 */
async function createOrganizationPost(req, res){
  
  // Ensure that the required fields are present before proceeding
  if (!req.body.organization_id || !req.body.content) {
    return res.status(400).json({ error : "Invalid request"});
  }

  try {
    // Check if the current user is a organization's administrator
    const isOrganizationAdmin = await knex('OrganizationAdministrator')
    .where('id_person', req.jwt.person_id)
    .where('id_organization', req.body.organization_id)
    .select('*')
    .first();
    
    // Non-exploitable TOC/TOU weakness
    if(!isOrganizationAdmin){
      return res.status(403).json({error : "Forbidden"});
    }

    const organizationPost = await knex('OrganizationPost')
    .insert({
      organization_id: req.body.organization_id,
      content: req.body.content,
      original_author: req.jwt.person_id
    })
    .returning('*');
    return res.status(200).json(organizationPost[0]);
  } 
  catch (error) {
    console.log(error);
    return res.status(500).json({error : "Internal server error"});
  }
}

/**
 * GET Request
 * 
 * Obtains an organization by its identifier.
 * 
 * Required field(s): none.
 * 
 * @returns the organization.
 */
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

/**
 * DELETE Request
 * 
 * Deletes a Post belonging to an Organization, only if
 * the logged user is an administrator of that Organization.
 * 
 * Required field(s): none.
 */
async function deleteOrganizationPost(req, res){

  const organizationPostIdToDelete = req.params.id;

  try{
    const isOrganizationAdmin = await knex('OrganizationPost')
      .join('OrganizationAdministrator', 'OrganizationPost.organization_id', 'OrganizationAdministrator.id_organization')
      .where('OrganizationPost.id', organizationPostIdToDelete)
      .where('OrganizationAdministrator.id_person', req.jwt.person_id)
      .select('*')
      .first();

      // Unexploitable TOC/TOU
      if(isOrganizationAdmin){
        await knex('OrganizationPost')
          .where('id', organizationPostIdToDelete)
          .del();
        return res.status(200).json({success : true});
      }
      else{
        return res.status(401).json({error : "Forbidden"});
      }
  }
  catch (error) {
    console.log(error);
    res.status(500).json({error : "Internal server error"});
  }
}

/**
 * POST Method
 * 
 * Add an Administrator to an Organization. Allowed only if the
 * logged user is an Administrator themselves.
 * 
 * Required field(s): organization_id, person_id
 */
async function addOrganizationAdmin(req, res){

  // Ensure that the required fields are present before proceeding
  if (!req.body.organization_id || !req.body.person_id) {
    return res.status(400).json({ error : "Invalid request"});
  }

  try {
    const isPersonAdmin = await knex('OrganizationAdministrator')
      .where('id_person', req.jwt.person_id)
      .where('id_organization', req.body.organization_id)
      .select('*')
      .first();

    if(!isPersonAdmin){
      return res.status(401).json({error : "Forbidden"});
    }

    await knex('OrganizationAdministrator')
      .insert({
        id_person: req.body.person_id,
        id_organization: req.body.organization_id
      });
    return res.status(200).json({success : true});
  }
  catch (error) {
    console.error('Error while adding organization admin: ' + error);
    res.status(500).json({error : "Internal server error"});
  }
}

/**
 * DELETE Request
 * 
 * Deletes a Person from the list of Administrators of an Organization.
 * The logged user can only remove themselves. If no more Administrators
 * are left, the Organization is removed.
 * 
 * Required field(s): organization_id
 */
async function removeOrganizationAdmin(req, res){
  
    // Ensure that the required fields are present before proceeding
    if (!req.body.organization_id) {
      return res.status(400).json({ error : "Invalid request"});
    }

    try{
      const transaction = await knex.transaction();

      // We lock the table to ensure that we won't have concurrency issues
      // while checking remainingAdministrators.
      // TODO: Understand whether a lock on the table is necessary
      await transaction.raw('LOCK TABLE "OrganizationAdministrator" IN SHARE MODE');
      
      await transaction('OrganizationAdministrator')
        .where('id_person', req.jwt.person_id)
        .where('id_organization', req.body.organization_id)
        .del();

      // TODO: If the user instead deletes their entire profile, the organization will not be deleted. Fix. (database schema)
      const remainingAdministrators = await transaction('OrganizationAdministrator')
        .where({ id_organization: req.body.organization_id });

      if (remainingAdministrators.length === 0) {
        // If no more users, delete the organization
        await transaction('Organization')
            .where('id', req.body.organization_id)
            .del();
      }

      await transaction.commit();
      return res.status(200).json({success : true});
    }
    catch (error){
      console.error(error);
      return res.status(500).json({ error: "Internal server error"});
    }
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

function generateToken(person_id) {
  // The payload the JWT will carry within itself
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

function isPostgresDateFormatValid(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

// Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
module.exports = {
    registerPerson,
    login,
    getPerson,
    getMyself,
    updatePerson,
    deletePerson,
    verifyToken,
    createOrganization,
    getOrganization,
    updateOrganization,
    deleteOrganization,
    createOrganizationPost,
    deleteOrganizationPost,
    addOrganizationAdmin,
    removeOrganizationAdmin
};