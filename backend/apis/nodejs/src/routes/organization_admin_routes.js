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

const organizationAdmin = require('../models/organization_admin_model');
const express = require('express');
const jwtUtils = require('../utils/jwt_utils');
const organizationAdminValidator = require('../utils/validators/organization_admin_validator');

/**
 * POST Method
 *
 * Add an Administrator to an Organization. Allowed only if the
 * logged user is an Administrator themselves.
 *
 * Required field(s): organization_id, person_id
 */
async function addOrganizationAdmin(req, res) {
  try {
    const errors = organizationAdminValidator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    const success = await organizationAdmin.insert(req.body.personId, req.params.organizationId, req.jwt.person_id);
    if (success) {
      return res.status(204).send();
    }
    return res.status(403).json({
      error: 'Forbidden'
    });
  } catch (error) {
    console.error(`Error in function ${addOrganizationAdmin.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
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
async function removeOrganizationAdmin(req, res) {
  try {
    const errors = organizationAdminValidator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    const success = await organizationAdmin.remove(req.jwt.person_id, req.params.organizationId);
    if (success) {
      return res.status(204).send();
    }
    return res.status(404).send();
  } catch (error) {
    console.error(`Error in function ${removeOrganizationAdmin.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

const routes = express.Router();
routes.post('/:organizationId/admins', jwtUtils.extractToken, organizationAdminValidator.addOrganizationAdminValidator, addOrganizationAdmin);
routes.delete('/:organizationId/admins/me', jwtUtils.extractToken, organizationAdminValidator.removeOrganizationAdminValidator, removeOrganizationAdmin);

module.exports = {
  routes
};