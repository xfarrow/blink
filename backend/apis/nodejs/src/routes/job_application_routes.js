// TODO: Create a validator
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
const jobApplicationValidator = require('../utils/validators/job_application_validator');

/**
 * **POST** Request
 * 
 * Inserts a new job application
 */
async function insert(req, res) {
  try {
    const errors = jobApplicationValidator.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    // Check if the job offer exists
    if (await JobOffer.findById(req.params.idJobOffer) == null) {
      return res.status(404).json({
        error: 'This job offer does not exist'
      });
    }

    // Check if the user has already applied for this position
    if (await Application.userAlreadyApplicated(req.jwt.person_id, req.params.idJobOffer)) {
      return res.status(400).json({
        error: 'User has already applied to this job'
      });
    }

    const application = await Application.insert(req.jwt.person_id, req.params.idJobOffer);
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
 * **GET** Request
 *
 * Obtain a JobApplication. Only the user themselves or the organization
 * administrator can perform this action
 * 
 * @param {*} req
 * @param {*} res
 */
async function find(req, res) {
  try {
    const errors = jobApplicationValidator.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const jobApplication = await Application.find(req.params.idApplication);
    if (jobApplication == null) {
      return res.status(404).send();
    }
    // Case in which the user themselves requested it
    if (jobApplication.person_id == req.jwt.person_id) {
      return res.status(200).json(jobApplication)
    } else {
      const isPersonOrganizationAdmin = await Application.isPersonJobApplicationAdministrator(jobApplication.id, req.jwt.person_id);
      if (isPersonOrganizationAdmin === true) {
        return res.status(200).json(jobApplication)
      } else {
        return res.status(401).json({
          error: 'Forbidden'
        });
      }
    }
  } catch (error) {
    console.error(`Error in function ${find.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * **GET** Request
 * 
 * Retrieves all the job applications of the logged in user
 */
async function myApplications(req, res) {
  try {
    const errors = jobApplicationValidator.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const applications = await Application.getMyApplications(req.jwt.person_id, req.body.organizationId);
    return res.status(200).json(applications);
  } catch (error) {
    console.error(`Error in function ${myApplications.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * **GET** Request 
 * 
 * Retrieve all the applications who applicated to a job offer.
 * Only an organization administrator is allowed to perform this action.
 */
async function getApplicationsByJobOffer(req, res) {
  try {
    const errors = jobApplicationValidator.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    
    const isAdmin = await JobOffer.isPersonJobOfferAdministrator(req.jwt.person_id, req.params.idJobOffer);
    if (!isAdmin) {
      return res.status(401).json({
        error: 'Forbidden'
      });
    }
    const applicants = await Application.getApplicantsByJobOffer(req.params.idJobOffer);
    return res.status(200).json(applicants);
  } catch (error) {
    console.error(`Error in function ${getApplicationsByJobOffer.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * **GET** Request
 * 
 * Retrieve all the applicants who applicated to a job offer created
 * by the specific organization.
 * Only an organization administrator is allowed to perform this action.
 */
async function getApplicationsByOrganization(req, res) {
  try {
    const errors = jobApplicationValidator.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const isAdmin = await OrganizationAdmin.isAdmin(req.jwt.person_id, req.params.idOrganization);
    if (!isAdmin) {
      return res.status(401).json({
        error: 'Forbidden'
      });
    }
    const applicants = await Application.getApplicantsByOrganization(req.params.idOrganization);
    return res.status(200).json(applicants);
  } catch (error) {
    console.error(`Error in function ${getApplicationsByOrganization.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * **DELETE** Request
 *
 * Removes a job application. Only the applicant is allowed to do that.
 */
async function remove(req, res) {
  try {
    const errors = jobApplicationValidator.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const jobApplication = await Application.find(req.params.idApplication);
    if (jobApplication == null) {
      return res.status(404).send();
    }
    if (jobApplication.person_id !== req.jwt.person_id) {
      return res.status(401).json({
        error: 'Forbidden'
      });
    }
    await Application.remove(req.params.idApplication);
    return res.status(200).send();
  } catch (error) {
    console.error(`Error in function ${remove.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

/**
 * **PATCH** Request
 * 
 * Sets a new status to a JobApplication. Only an Organization Administrator
 * can perform this action
 */
async function setStatus(req, res) {
  try {
    const errors = jobApplicationValidator.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const canPersonSetStatus = await Application.isPersonJobApplicationAdministrator(req.params.idApplication, req.jwt.person_id);
    if (!canPersonSetStatus) {
      return res.status(401).json({
        error: 'Forbidden'
      });
    }
    await Application.setStatus(req.params.idApplication, req.body.status);
    return res.status(204).send();
  } catch (error) {
    console.error(`Error in function ${setStatus.name}: ${error}`);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

const routes = express.Router();
routes.post('/joboffers/:idJobOffer/applications', jwtUtils.extractToken, jobApplicationValidator.insertValidator, insert);
routes.get('/joboffers/:idJobOffer/applications/:idApplication', jwtUtils.extractToken, jobApplicationValidator.findValidator, find);
routes.get('/joboffers/applications/mine', jwtUtils.extractToken, jobApplicationValidator.myApplicationsValidator, myApplications);
routes.get('/joboffers/:idJobOffer/applications', jwtUtils.extractToken, jobApplicationValidator.getApplicationsByJobOfferValidator, getApplicationsByJobOffer);
routes.get('/:idOrganization/joboffers/applications', jwtUtils.extractToken, jobApplicationValidator.getApplicationsByOrganizationValidator, getApplicationsByOrganization);
routes.delete('/joboffers/applications/:idApplication', jwtUtils.extractToken, jobApplicationValidator.removeValidator, remove);
routes.patch('/joboffers/applications/:idApplication', jwtUtils.extractToken, jobApplicationValidator.setStatusValidator, setStatus);

module.exports = {
  routes
};