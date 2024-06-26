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

const Organization = require('../models/organization_model');
const express = require('express');
const jwtUtils = require('../utils/jwt_utils');
const organizationValidator = require('../utils/validators/organization_validator');

/**
 * POST Request
 *
 * Creates an Organization and its Administrator.
 *
 * Required field(s): name
 *
 * @returns the inserted organization
 */
async function createOrganization(req, res) {

  try {
    const errors = organizationValidator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    const organization = Organization.createOrganization(req.body.name, req.body.location, req.body.description);
    const insertedOrganization = await Organization.insert(organization, req.jwt.person_id);
    res.set('Location', `/api/organizations/${insertedOrganization.id}`);
    return res.status(201).json(insertedOrganization);
  } catch (error) {
    console.error(`Error in function ${createOrganization.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * PATCH Request
 * Updates an Organization's details
 *
 * Required field(s): none.
 */
async function updateOrganization(req, res) {
  const errors = organizationValidator.validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const updateOrganization = {};

  if (req.body.name !== undefined) {
    updateOrganization.name = req.body.name;
  }

  if (req.body.location !== undefined) {
    updateOrganization.location = req.body.location;
  }

  if (req.body.description !== undefined) {
    updateOrganization.description = req.body.description;
  }

  if (req.body.is_hiring !== undefined) {
    updateOrganization.is_hiring = req.body.is_hiring;
  }

  if (Object.keys(updateOrganization).length === 0) {
    return res.status(400).json({
      error: 'Bad request. No data to update'
    });
  }

  try {
    const isUpdateSuccessful = Organization.update(updateOrganization, req.params.id, req.jwt.person_id);
    if (isUpdateSuccessful) {
      return res.status(204).send();
    } else {
      return res.status(404).json({
        error: 'Organization either not found or insufficient permissions'
      });
    }
  } catch (error) {
    console.error(`Error in function ${updateOrganization.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * DELETE Request
 *
 * Deletes the specified organization if the logged user is
 * one of its administrator
 */
async function deleteOrganization(req, res) {
  try {
    const errors = organizationValidator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    const isDeleteSuccessful = await Organization.remove(req.params.id, req.jwt.person_id);
    if (isDeleteSuccessful) {
      return res.status(204).send();
    }
    return res.status(403).json({
      error: 'Forbidden'
    });
  } catch (error) {
    console.error(`Error in function ${deleteOrganization.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
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
async function getOrganization(req, res) {
  try {
    const errors = organizationValidator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    const organization = await Organization.findById(req.params.id);
    if (organization) {
      return res.status(200).json(organization);
    } else {
      return res.status(404).json({
        error: 'Not found'
      });
    }
  } catch (error) {
    console.error(`Error in function ${getOrganization.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

async function filter(req, res) {
  try {
    const errors = organizationValidator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    const organizations = await Organization.filterByPrefix(req.body.name);
    return res.status(200).json(organizations).send();
  } catch (error) {
    console.error(`Error in function ${getOrganization.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Here we can not use the jwtUtils.extractToken as the Router's middleware directly, as the latter
// will be mounted under /organizations, but there are other resources under /organizations
// that do not require the authorization, e.g. job offers
const routes = express.Router();
routes.get('/:id', organizationValidator.deleteOrGetOrganizationValidator, getOrganization);
routes.post('/filter', organizationValidator.filterValidator, filter);
routes.post('/', jwtUtils.extractToken, organizationValidator.createOrganizationValidator, createOrganization);
routes.patch('/:id', jwtUtils.extractToken, organizationValidator.updateOrganizationValidator, updateOrganization);
routes.delete('/:id', jwtUtils.extractToken, organizationValidator.deleteOrGetOrganizationValidator, deleteOrganization);

module.exports = {
  routes
};