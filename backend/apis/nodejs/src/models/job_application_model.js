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
const knex = require('../utils/knex_config');
const OrganizationAdmin = require('../models/organization_admin_model');

/**
 * Inserts a new JobApplication.
 *
 * @param {*} personId The ID of the Person applying for the job
 * @param {*} jobOfferId The ID of the job
 * @returns The inserted JobApplication object if successful, throws an
 * exception otherwise
 */
async function insert(personId, jobOfferId) {
    return await knex('JobApplication')
        .insert({
            person_id: personId,
            job_offer_id: jobOfferId
        })
        .returning("*");
}

async function userAlreadyApplicated(personId, jobOfferId) {
    const person = await knex('JobApplication')
        .where('person_id', personId)
        .where('job_offer_id', jobOfferId)
        .select('*')
        .first();
    if (person) {
        return true;
    }
    return false;
}

/**
 * Retrieves all the applications of the specified Person, including data from
 * JobOffer and Organization. It is useful when a person wants to retrieve
 * their applications
 * @param {*} personId 
 * @returns All the applications of the specified Person, throws an exception
 * otherwise
 */
async function getMyApplications(personId, organizationId) {
    const query = knex('JobApplication')
        .where('person_id', personId)
        .join('JobOffer', 'JobOffer.id', 'JobApplication.job_offer_id')
        .join('Organization', 'Organization.id', 'JobOffer.organization_id')
        .select('JobApplication.id', 'JobOffer.id AS JobOfferId', 'JobOffer.title', 'JobOffer.description', 'Organization.id AS OrganizationId', 'Organization.name', 'Organization.location');

    if (organizationId != null) {
        query.where('Organization.id', organizationId);
    }

    return (await query).map(myApplication => ({
        id: myApplication.id,
        JobOffer: {
            id: myApplication.JobOfferId,
            title: myApplication.title,
            description: myApplication.description
        },
        Organization: {
            id: myApplication.OrganizationId,
            name: myApplication.name,
            location: myApplication.location
        }
    }));
}

/**
 * Retrieves all the applicants of the specified JobOffer
 * under the form of a subset of properties of the Person
 * object
 *
 * @param {*} organizationId
 */
async function getApplicantsByJobOffer(jobOfferId) {
    return await knex('JobApplication')
        .where('job_offer_id', jobOfferId)
        .join('Person', 'Person.id', 'JobApplication.person_id')
        .select('Person.id AS person_id', 'Person.display_name', 'Person.qualification', 'Person.about_me');
}

/**
 * Retrieves all the applicants and the relative JobOffer they
 * applied to
 *
 * @param {*} organizationId
 * @returns An array of Person and JobOffer objects. Throws an exception if an error occurs
 */
async function getApplicantsByOrganization(organizationId) {
    const applicants = await knex('JobApplication')
        .join('Person', 'Person.id', 'JobApplication.person_id')
        .join('JobOffer', 'JobOffer.id', 'JobApplication.job_offer_id')
        .join('Organization', 'Organization.id', 'JobOffer.organization_id')
        .where('Organization.id', organizationId)
        .select('Person.id AS person_id', 'Person.display_name', 'Person.qualification', 'Person.about_me', 'JobOffer.id AS job_offer_id', 'JobOffer.title', 'JobOffer.description');

    return applicants.map(applicant => ({
        Person: {
            person_id: applicant.person_id,
            display_name: applicant.display_name,
            qualification: applicant.qualification,
            about_me: applicant.about_me,
        },
        JobOffer: {
            job_offer_id: applicant.job_offer_id,
            title: applicant.title,
            description: applicant.description,
        },
    }));
}

async function find(jobApplicationId) {
    return await knex('JobApplication')
        .where('id', jobApplicationId)
        .first();
}

async function remove(jobApplicationId) {
    return await knex('JobApplication')
        .where('id', jobApplicationId)
        .del();
}

async function setStatus(jobApplicationId, status) {
    return await knex('JobApplication')
        .where('id', jobApplicationId)
        .update('application_status', status);
}

/**
 * Determines whether the submitted personId represents an administrator
 * of the company which created the joboffer of the current application
 * @param {*} jobApplicationId 
 * @param {*} personId 
 */
async function isPersonJobApplicationAdministrator(jobApplicationId, personId) {
    const organization = await knex('JobApplication')
        .where('JobApplication.id', jobApplicationId)
        .join('JobOffer', 'JobOffer.id', 'JobApplication.job_offer_id')
        .join('Organization', 'Organization.id', 'JobOffer.organization_id')
        .first()
        .select('Organization.id');
    if (organization == null) {
        return false;
    }
    const isAdmin = await OrganizationAdmin.isAdmin(personId, organization.id);
    return isAdmin;
}

module.exports = {
    insert,
    userAlreadyApplicated,
    getMyApplications,
    getApplicantsByJobOffer,
    getApplicantsByOrganization,
    find,
    remove,
    setStatus,
    isPersonJobApplicationAdministrator
}