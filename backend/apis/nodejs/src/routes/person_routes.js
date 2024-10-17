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

const personValidator = require('../utils/validators/person_validator');
const jwtUtils = require('../utils/jwt_utils');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Person = require('../models/person_model');
const Activation = require('../models/activation_model');
const express = require('express');
const mailUtils = require('../utils/mail_utils');

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
  try {
    const errors = personValidator.validationResult(req);
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

    // Check whether e-mail exists already (enforced by database constraints)
    const existingUser = await Person.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(409).json({
        error: 'E-mail already in use'
      });
    }

    let activationCode = null;
    let isEnabled = true;
    if (process.env.NEEDS_EMAIL_VERIFICATION === 'true') {
      activationCode = crypto.randomBytes(16).toString('hex');
      isEnabled = false;
    }

    // Hash provided password
    const hashPasswordPromise = bcrypt.hash(req.body.password, 10);
    
    const personToInsert = Person.createPerson(
      req.body.email,
      await hashPasswordPromise,
      req.body.displayName,
      req.body.dateOfBirth,
      req.body.placeOfLiving,
      req.body.aboutMe,
      req.body.qualification,
      req.body.openToWork,
      isEnabled,
    );
    const insertedPerson = await Person.insert(personToInsert, activationCode);
    delete insertedPerson.password;

    if (process.env.NEEDS_EMAIL_VERIFICATION === 'true') {
      mailUtils.sendConfirmationLink(req.body.email, activationCode);
    }

    res.set('Location', `/api/${insertedPerson.id}/details`);
    return res.status(201).json(insertedPerson);

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
async function createToken(req, res) {
  try {
    const errors = personValidator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    const person = await Person.authenticate(req.body.email, req.body.password);
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
    console.error(`Error in function ${createToken.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * GET Request
 * 
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
    const person = await Person.findById(req.params.id);
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
    const person = await Person.findById(req.jwt.person_id);
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
 * Required field(s): At least one. Both oldPassword and
 * newPassword if updating the password.
 *
 */
async function updatePerson(req, res) {
  try {
    const errors = personValidator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const updatePerson = {};

    if (req.body.displayName !== undefined) {
      updatePerson.display_name = req.body.displayName;
    }

    if (req.body.dateOfBirth !== undefined) {
      updatePerson.date_of_birth = req.body.dateOfBirth;
    }

    if (req.body.openToWork !== undefined) {
      updatePerson.open_to_work = req.body.openToWork;
    }

    if (req.body.placeOfLiving !== undefined) {
      updatePerson.place_of_living = req.body.placeOfLiving;
    }

    if (req.body.aboutMe !== undefined) {
      updatePerson.about_me = req.body.aboutMe;
    }

    if (req.body.qualification !== undefined) {
      updatePerson.qualification = req.body.qualification;
    }

    if (req.body.visibility !== undefined) {
      updatePerson.visibility = req.body.visibility;
    }

    // If we are tying to change password, the old password must be provided
    if (req.body.oldPassword !== undefined || req.body.newPassword !== undefined) {
      if (req.body.oldPassword === undefined) {
        return res.status(401).json({
          error: 'The old password must be specified'
        });
      }
      if (req.body.newPassword === undefined) {
        return res.status(401).json({
          error: 'The new password must be specified'
        });
      }
      const user = await Person.findById(req.jwt.person_id);
      const passwordMatches = await bcrypt.compare(req.body.oldPassword, user.password);
      if (passwordMatches) {
        updatePerson.password = await bcrypt.hash(req.body.newPassword, 10);
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

    await Person.update(updatePerson, req.jwt.person_id);
    return res.status(204).send();
  } catch (error) {
    console.error(`Error in function ${updatePerson.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * DELETE Request
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
    await Person.remove(req.jwt.person_id);
    return res.status(204).send();
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
 * Required field(s): q (identifier)
 */
async function confirmActivation(req, res) {
  try {
    const errors = personValidator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    const personId = await Activation.getPersonIdByIdentifier(req.body.code);
    if (!personId) {
      return res.status(401).json({
        error: 'Activation Link either not valid or expired'
      });
    }
    await Person.confirmActivation(personId);
    return res.status(204).send();
  } catch (error) {
    console.error(`Error in function ${confirmActivation.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

const publicRoutes = express.Router(); // Routes not requiring token
publicRoutes.post('/', personValidator.registerValidator, registerPerson);
publicRoutes.post('/me/token', personValidator.getTokenValidator, createToken);
publicRoutes.get('/:id/details', getPerson);
publicRoutes.post('/me/activation', personValidator.confirmActivationValidator, confirmActivation);

const protectedRoutes = express.Router(); // Routes requiring token
protectedRoutes.use(jwtUtils.extractToken);
protectedRoutes.get('/me', getMyself);
protectedRoutes.patch('/me', personValidator.updatePersonValidator, updatePerson);
protectedRoutes.delete('/me', deletePerson);

// Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
module.exports = {
  publicRoutes,
  protectedRoutes
};