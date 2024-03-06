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

const organizationAdminModel = require('../models/organization_admin_model');
const express = require('express');
const jwtUtils = require('../utils/middleware_utils');

/**
 * POST Method
 *
 * Add an Administrator to an Organization. Allowed only if the
 * logged user is an Administrator themselves.
 *
 * Required field(s): organization_id, person_id
 */
async function addOrganizationAdmin(req, res) {
  // Ensure that the required fields are present before proceeding
  if (!req.params.id || !req.body.person_id) {
    return res.status(400).json({
      error: 'Invalid request'
    });
  }

  try {
    const success = await organizationAdminModel.addOrganizationAdministrator(req.body.person_id, req.params.id, req.jwt.person_id);
    if (success) {
      return res.status(200).json({
        success: true
      });
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
  // Ensure that the required fields are present before proceeding
  if (!req.params.organizationId) {
    return res.status(400).json({
      error: 'Invalid request'
    });
  }

  try {
    await organizationAdminModel.removeOrganizationAdmin(req.jwt.person_id, req.params.organizationId);
    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error(`Error in function ${removeOrganizationAdmin.name}: ${error}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

const protectedRoutes = express.Router();
protectedRoutes.use(jwtUtils.verifyToken);
protectedRoutes.post('/organizations/:id/admins', addOrganizationAdmin);
protectedRoutes.delete('/organizations/:organizationId/admins/me', removeOrganizationAdmin);

module.exports = {
  protectedRoutes
};