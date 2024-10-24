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

const Application = require('../models/job_application_model');
const JobOffer = require('../models/job_offer_model');
const OrganizationAdmin = require('../models/organization_admin_model');
const express = require('express');
const jwtUtils = require('../utils/jwt_utils');

/**
 * POST Request
 * 
 * Inserts a new job application
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function insert(req, res) {
  try {
    // Check if the job offer exists
    if (await JobOffer.findById(req.body.jobOfferId) == null) {
      return res.status(404).json({
        error: 'This job offer does not exist'
      });
    }

    // Check if the user has already applied for this position
    if (await Application.userAlreadyApplicated(req.jwt.person_id, req.body.jobOfferId)) {
      return res.status(400).json({
        error: 'User has already applied to this job'
      });
    }

    const application = await Application.insert(req.jwt.person_id, req.body.jobOfferId);
    res.set('Location', `/api/applications/${application.id}`);
    return res.status(201).json(application);
  } catch (error) {
    console.error(`Error in function ${insert.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * GET Request
 * 
 * Retrieves all the job applications of the logged in user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function myApplications(req, res) {
  try {
    const applications = await Application.getMyApplications(req.jwt.person_id);
    return res.status(200).json(applications);
  } catch (error) {
    console.error(`Error in function ${myApplications.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * GET Request. Retrieve all the applicants who applicated to a job offer.
 * Only an organization administrator is allowed to perform this action.
 * @param {*} req 
 * @param {*} res 
 */
async function getApplicantsByJobOffer(req, res) {
  try {
    const isAdmin = await OrganizationAdmin.isAdmin(req.jwt.person_id, jobOffer.organization_id);
    if(!isAdmin){
      return res.status(401).json({
        error: 'Forbidden'
      });
    }
    const applicants = await Application.getApplicantsByJobOffer(req.body.jobOfferId);
    return res.status(200).json(applicants);
  } catch (error) {
    console.error(`Error in function ${getApplicantsByJobOffer.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * GET Request. Retrieve all the applicants who applicated to a job offer created
 * by the specific organization.
 * Only an organization administrator is allowed to perform this action.
 * @param {*} req 
 * @param {*} res 
 */
async function getApplicantsByOrganization(req, res){
  try {
    const isAdmin = await OrganizationAdmin.isAdmin(req.jwt.person_id, req.body.organizationId);
    if(!isAdmin){
      return res.status(401).json({
        error: 'Forbidden'
      });
    }
    const applicants = await Application.getApplicansByOrganization(req.body.organizationId);
    return res.status(200).json(applicants);
  } catch (error) {
    console.error(`Error in function ${getApplicantsByOrganization.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

const routes = express.Router();
routes.post('/', jwtUtils.extractToken, insert);
routes.get('/myapplications', jwtUtils.extractToken, myApplications);
routes.get('/applicantsbyjoboffer', jwtUtils.extractToken, getApplicantsByJobOffer);
routes.get('/applicantsbyorganization', jwtUtils.extractToken, getApplicantsByOrganization);

module.exports = {
  routes
};