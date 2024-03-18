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
 * Create Organization object
 * @param {*} name
 * @param {*} location
 * @param {*} description
 * @param {*} isHiring
 * @returns
 */
function createOrganization(name, location, description) {
  const organization = {
    name: name,
    location: location,
    description: description
  };
  return organization;
}

/**
 * Gets an Organization by its identifier
 * @param {*} id
 * @returns the Organization
 */
async function findById(id) {
  const organization = await knex('Organization')
    .where('id', id)
    .select('*')
    .first();
  return organization;
}

/**
 * Insert an Organization and its relative Administrator.
 * @param {*} organization
 * 
 * @returns The inserted Organization
 */
async function insert(organization, organizationAdministratorId) {
  return await knex.transaction(async (trx) => {
    // We have to insert either both in Organization and in OrganizationAdministrator
    // or in neither
    const organizationResult = await trx('Organization')
      .insert(organization, '*');

    // Inserting in the "OrganizationAdministrator" table
    await trx('OrganizationAdministrator')
      .insert({
        id_person: organizationAdministratorId,
        id_organization: organizationResult[0].id
      });

    return organizationResult[0];
  });
}

/**
 * Updates an Organization specified by the OrganizationId, if and
 * only if the specified requester is one of its Administrator
 * @param {*} organization
 * @param {*} organizationId
 * @param {*} requester
 * @returns true if the row was updated, false otherwise
 */
async function update(organization, organizationId, requester) {
  const numberOfUpdatedRows = await knex('Organization')
    .where('id', organizationId)
    .whereExists(function () {
      this.select('*')
        .from('OrganizationAdministrator')
        .where('id_person', requester)
        .where('id_organization', organizationId);
    })
    .update(organization);
  return numberOfUpdatedRows == 1;
}

/**
 * Deletes an Organization if the specified PersonId is
 * one of its administrators
 * @param {*} organizationId Id of the Organization to delete
 * @param {*} requester PersonId of the supposedly administrator
 * @returns true if the Organization was successfully deleted, false otherwise
 */
async function remove(organizationId, requester) {
  const numberOfDeletedRows = await knex('Organization')
    .where({
      id: organizationId
    })
    .whereExists(function () {
      this.select('*')
        .from('OrganizationAdministrator')
        .where('id_person', requester)
        .where('id_organization', organizationId);
    })
    .del();
  return numberOfDeletedRows == 1;
}

// Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
module.exports = {
  findById,
  createOrganization,
  insert,
  update,
  remove
};