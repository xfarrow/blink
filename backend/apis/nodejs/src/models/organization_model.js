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
function createOrganization (name, location, description, isHiring) {
  const organization = {
    name: name,
    location: location,
    description: description,
    is_hiring: isHiring
  };
  return organization;
}

/**
 * Gets an Organization by its identifier
 * @param {*} id
 * @returns the Organization
 */
async function getOrganizationById (id) {
  const organization = await knex('Organization')
    .where('id', id)
    .select('*')
    .first();
  return organization;
}

/**
 * Insert an Organization and its relative Administrator
 * @param {*} organization
 */
async function insertOrganization (organization, organizationAdministratorId) {
  await knex.transaction(async (trx) => {
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
async function updateOrganization (organization, organizationId, requester) {
  // // const isOrganizationAdmin = await knex('OrganizationAdministrator')
  // // .where('id_person', req.jwt.person_id)
  // // .where('id_organization', req.params.id)
  // // .select('*')
  // // .first();

  // // // This introduces a Time of check Time of use weakeness
  // // // which could'have been fixed by either
  // // // 1) Using "whereExists", thanks to the "it's easier to ask for
  // // // forgiveness than for permission" padarigm. Or,
  // // // 2) Using a serializable transaction.
  // // //
  // // // The undersigned chose not to follow these approaches because
  // // // this does not introduces any serious vulnerability. In this
  // // // way it seems more readable.

  // // if(!isOrganizationAdmin){
  // //   return res.status(403).json({error : "Forbidden"});
  // // }

  // // await knex('Organization')
  // // .where('id', req.params.id)
  // // .update({
  // //   name: req.body.name,
  // //   location: req.body.location,
  // //   description: req.body.description,
  // //   is_hiring: req.body.isHiring
  // // });

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
async function deleteOrganization (organizationId, requester) {
  const numberOfDeletedRows = await knex('Organization')
    .where({ id: organizationId })
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
  getOrganizationById,
  createOrganization,
  insertOrganization,
  updateOrganization,
  deleteOrganization
};
