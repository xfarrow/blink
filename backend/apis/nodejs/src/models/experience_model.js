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

function createExperience(title, description, organizationId, organizationName, date, person_id, type) {
    const experience = {
        title,
        description,
        organization_id: organizationId, // Either OrganizationId or OrganizationName should be set, not both (TODO in validator)
        organization_name: organizationName, // Either OrganizationId or OrganizationName should be set, not both (TODO in validator)
        date,
        person_id,
        type
    };
    return experience;
}

async function insert(experience) {
    const insertedExperience = await knex('Experience')
        .insert(experience)
        .returning('*');
    return insertedExperience[0];
}

async function find(experienceId) {
    return await knex('Experience').where({
        id: experienceId
    }).select().first();
}

async function remove(experienceId, personId) {
    await knex('Experience')
        .where({
            id: experienceId,
            person_id: personId
        })
        .del();
}

async function update(experience) {
    await knex('Experience')
        .where('id', experience.id)
        .update(experience);
}

// Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
module.exports = {
    createExperience,
    insert,
    find,
    remove,
    update
};