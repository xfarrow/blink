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

async function userAlreadyApplicated(personId, jobOfferId){
    const person = await knex('JobApplication')
        .where('person_id', personId)
        .where('job_offer_id', jobOfferId)
        .select('*')
        .first();
    if(person){
        return true;
    }
    return false;
}

/**
 * Retrieves all the applications of the specified Person, includinf data from
 * JobOffer and Organization
 * @param {*} personId 
 * @returns All the applications of the specified Person, throws an exception
 * otherwise
 */
async function getApplications(personId){
    return await knex('JobApplication')
        .where('person_id', personId)
        .join('JobOffer', 'JobOffer.id', 'JobApplication.job_offer_id')
        .join('Organization', 'Organization.id', 'JobOffer.organization_id')
        .select('JobApplication.id', 'JobOffer.title', 'JobOffer.description',  'Organization.name', 'Organization.location');
}

module.exports = {
    insert,
    userAlreadyApplicated,
    getApplications
}