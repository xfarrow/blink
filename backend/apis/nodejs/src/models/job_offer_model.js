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

async function insert(requester, organizationId, title, description, requirements, salary, salaryFrequency, salaryCurrency, location, tags) {
    const isAdmin = await OrganizationAdmin.isAdmin(requester, organizationId);
    if (isAdmin) {
        return await knex.transaction(async (tr) => {
            const jobOffer = await tr('JobOffer').insert({
                    title,
                    description,
                    requirements,
                    salary,
                    salary_frequency: salaryFrequency,
                    location,
                    organization_id: organizationId,
                    salary_currency: salaryCurrency
                })
                .returning('*');

            // Insert in the JobOfferTag table all the relevant tags.
            if (tags) {
                await Promise.all(tags.map(tag =>
                    tr('JobOfferTag').insert({
                        job_offer_id: jobOffer[0].id,
                        tag_id: tag.id
                    })
                ));
            }
            return jobOffer[0];
        });
    }
    return null;
}

async function remove(requester, jobOfferId) {
    const jobOffer = await findById(jobOfferId);
    const isAdmin = await OrganizationAdmin.isAdmin(requester, jobOffer.organization_id);
    if (isAdmin) {
        const deletedRows = await knex('JobOffer')
            .where({
                id: jobOfferId
            }).del();
        return deletedRows === 1;
    } else {
        return false;
    }
}

async function findById(jobOfferId) {
    return await knex('JobOffer').where({
        id: jobOfferId
    }).select().first();
}

// test
async function filter(title, description, requirements, salary, salaryOperator, salaryFrequency, location, tags) {
    let query = knex('JobOffer');
    if (title) {
        query.where('title', 'ilike', `%${title}%`); //ilike = insensitive like
    }
    if (description) {
        query.where('description', 'ilike', `%${description}%`);
    }
    if (requirements) {
        query.where('requirements', 'ilike', `%${requirements}%`);
    }
    if (salary && salaryOperator) {
        query.where('salary', salaryOperator, salary);
    }
    if (salaryFrequency) {
        query.where({
            salary_frequency: salaryFrequency
        });
    }
    if (location) {
        query.where('location', 'ilike', `%${location}%`);
    }
    if (tags) {
        tags.forEach((tag) => {
            // query = query.where({});
        });
    }
    return await query.select();
}

module.exports = {
    insert,
    remove
}