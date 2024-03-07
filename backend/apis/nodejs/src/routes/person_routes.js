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

const validator = require('../utils/validators/person_validator');
const jwtUtils = require('../utils/middleware_utils');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const personModel = require('../models/person_model');
const activationModel = require('../models/activation_model');
const express = require('express');

/**
 * POST Request
 *
 * Registers a Person
 *
 * Required field(s): name, email (valid ISO standard), password
 *
 * @returns The activationlink identifier
 */
async function registerPerson(req, res) {

  const errors = validator.validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  // Does this server allow users to register?
  if (process.env.ALLOW_USER_REGISTRATION === 'false') {
    return res.status(403).json({
      error: 'Users cannot register on this server'
    });
  }

  // Generate activation link token
  const activationLink = crypto.randomBytes(16).toString('hex');
  // Hash provided password
  const hashPasswordPromise = bcrypt.hash(req.body.password, 10);

  try {
    // Check whether e-mail exists already (enforced by database constraints)
    const existingUser = await personModel.getPersonByEmail(req.body.email);
    if (existingUser) {
      return res.status(409).json({
        error: 'E-mail already in use'
      });
    }
    const personToInsert = personModel.createPerson(
      req.body.email,
      await hashPasswordPromise,
      req.body.display_name,
      req.body.date_of_birth,
      req.body.available,
      false,
      req.body.place_of_living,
      req.body.about_me,
      req.body.qualification);
    await personModel.registerPerson(personToInsert, activationLink);
    return res.status(200).json({
      activationLink
    });
  } catch (error) {
    console.error(`Error in function ${registerPerson.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
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
async function createTokenByEmailAndPassword(req, res) {

  try {
    const person = await personModel.getPersonByEmailAndPassword(req.body.email, req.body.password);
    if (person) {
      const token = jwtUtils.generateToken(person.id);
      return res.status(200).json({
        token
      });
    } else {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error(`Error in function ${createTokenByEmailAndPassword.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
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
async function getPerson(req, res) {
  try {
    const person = await personModel.getPersonById(req.params.id);
    if (person && person.enabled) {
      delete person.password; // remove password field for security reasons
      return res.status(200).send(person);
    }
    return res.status(404).json({
      error: 'Not found'
    });
  } catch (error) {
    console.error(`Error in function ${getPerson.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
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
async function getMyself(req, res) {
  try {
    const person = await personModel.getPersonById(req.jwt.person_id);
    if (person) {
      delete person.password;
      return res.status(200).send(person);
    }
    return res.status(404).json({
      error: 'Not found'
    });
  } catch (error) {
    console.error(`Error in function ${getMyself.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * PATCH request
 *
 * Updates a Person's details. If some details are
 * not present, they shall be ignored. An user can
 * only update themselves
 *
 * Required field(s): At least one. Both old_password and
 * new_password if updating the password.
 *
 */
async function updatePerson(req, res) {
  const updatePerson = {};

  if (req.body.display_name != undefined) {
    updatePerson.display_name = req.body.display_name;
  }

  if (req.body.date_of_birth != undefined) {
    updatePerson.date_of_birth = req.body.date_of_birth;
  }

  if (req.body.available != undefined) {
    updatePerson.available = req.body.available;
  }

  if (req.body.place_of_living != undefined) {
    updatePerson.place_of_living = req.body.place_of_living;
  }

  if (req.body.about_me != undefined) {
    updatePerson.about_me = req.body.about_me;
  }

  if (req.body.qualification != undefined) {
    updatePerson.qualification = req.body.qualification;
  }

  // If we are tying to change password, the old password must be provided
  if (req.body.old_password != undefined || req.body.new_password != undefined) {
    if (req.body.old_password == undefined) {
      return res.status(401).json({
        error: 'The old password must be specified'
      });
    }
    if (req.body.new_password == undefined) {
      return res.status(401).json({
        error: 'The new password must be specified'
      });
    }
    const user = await personModel.getPersonById(req.jwt.person_id);
    const passwordMatches = await bcrypt.compare(req.body.old_password, user.password);
    if (passwordMatches) {
      updatePerson.password = await bcrypt.hash(req.body.new_password, 10);
    } else {
      return res.status(401).json({
        error: 'Password verification failed'
      });
    }
  }

  if (Object.keys(updatePerson).length === 0) {
    return res.status(400).json({
      error: 'Bad request. No data to update'
    });
  }

  try {
    await personModel.updatePerson(updatePerson, req.jwt.person_id);
    return res.status(200).json({
      success: 'true'
    });
  } catch (error) {
    console.error(`Error in function ${updatePerson.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
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
  // TODO: Delete Organization if this user was its only administrator
  try {
    await personModel.deletePerson(req.jwt.person_id);
    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error(`Error in function ${deletePerson.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * POST Request
 * 
 * Set 'enabled = true' for the Person associated
 * with the identifier.
 * 
 * Required field(s): identifier
 */
async function confirmActivation(req, res) {
  try {
    const personId = await activationModel.getPersonIdByIdentifier(req.query.q);
    if (!personId) {
      return res.status(401).json({
        error: 'Activation Link either not valid or expired'
      });
    }
    await personModel.confirmActivation(personId);
    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error(`Error in function ${confirmActivation.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

const publicRoutes = express.Router(); // Routes not requiring token
publicRoutes.post('/persons', validator.registerValidator, registerPerson);
publicRoutes.post('/persons/me/token', validator.getTokenValidator, createTokenByEmailAndPassword);
publicRoutes.get('/persons/:id/details', getPerson);
publicRoutes.get('/persons/me/activation', confirmActivation);

const protectedRoutes = express.Router(); // Routes requiring token
protectedRoutes.use(jwtUtils.verifyToken);
protectedRoutes.get('/persons/me', getMyself);
protectedRoutes.patch('/persons/me', updatePerson);
protectedRoutes.delete('/persons/me', deletePerson);

// Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
module.exports = {
  publicRoutes,
  protectedRoutes
};