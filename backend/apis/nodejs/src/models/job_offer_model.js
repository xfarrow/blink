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

async function insert(requester, organizationId, title, description, salaryMin, salaryMax, salaryFrequency, salaryCurrency, location, remote, contractType, tags) {
    const isAdmin = await OrganizationAdmin.isAdmin(requester, organizationId);
    if (isAdmin) {
        return await knex.transaction(async (tr) => {
            const jobOffer = await tr('JobOffer').insert({
                    organization_id: organizationId,
                    title,
                    description,
                    salary: salaryMin != null ? knex.raw(`int4range('[${salaryMin}, ${salaryMax}]')`) : null,
                    salary_frequency: salaryFrequency,
                    salary_currency: salaryCurrency,
                    location,
                    remote,
                    contract_type: contractType
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

    if (!jobOffer) {
        return false;
    }

    const isAdmin = await OrganizationAdmin.isAdmin(requester, jobOffer.organization_id);

    if (!isAdmin) {
        return false;
    }

    const deletedRows = await knex('JobOffer')
        .where({
            id: jobOfferId
        })
        .del();
    return deletedRows === 1;
}

async function findById(jobOfferId) {
    return await knex('JobOffer').where({
        id: jobOfferId
    }).select().first();
}

/**
 * Get all job offers for a specific organization
 * @param {*} organizationId The organization id for which
 * you're looking job offers for
 * @returns An array of JobOffers plus associated tags
 */
async function findByOrganizationId(organizationId) {
    // This is equal to
    //
    // select "JobOffer".*, json_agg("Tag".tag) as tags
    // from "JobOffer"
    // left join "JobOfferTag" on "JobOffer".id = "JobOfferTag".job_offer_id
    // left join "Tag" on "JobOfferTag".tag_id = "Tag".id
    // where "JobOffer".organization_id = organizationId
    // GROUP BY "JobOffer".id
    const result = await knex('JobOffer')
        .select('JobOffer.*', knex.raw('json_agg("Tag".tag) as tags'))
        .leftJoin('JobOfferTag', 'JobOffer.id', 'JobOfferTag.job_offer_id')
        .leftJoin('Tag', 'JobOfferTag.tag_id', 'Tag.id')
        .where('JobOffer.organization_id', organizationId)
        .groupBy('JobOffer.id');
    return result;
}

async function isPersonJobOfferAdministrator(personId, jobOfferId) {
    const organization = await knex('JobOffer')
        .where('JobOffer.id', jobOfferId)
        .join('Organization', 'Organization.id', 'JobOffer.organization_id')
        .first()
        .select('Organization.id');
    if (organization == null) {
        return false;
    }
    const isAdmin = await OrganizationAdmin.isAdmin(personId, organization.id);
    return isAdmin;
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
    remove,
    findByOrganizationId,
    findById,
    isPersonJobOfferAdministrator
}