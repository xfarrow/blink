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
 * Checks whether the specified person is an administrator
 * of the specified administrator
 * @param {*} personId
 * @param {*} organizationId
 * @returns true if administrator, false otherwise
 */
async function isPersonOrganizationAdministrator (personId, organizationId) {
  const isPersonAdmin = await knex('OrganizationAdministrator')
    .where('id_person', personId)
    .where('id_organization', organizationId)
    .select('*')
    .first();
  return !!isPersonAdmin;
}

/**
 * Add the specified Person as the Organization administrator, if thr requester is already
 * an administrator
 * @param {*} personId Id of the person to add as administrator
 * @param {*} organizationId
 * @param {*} requester Id of the person requesting the addition
 */
async function addOrganizationAdministrator (personId, organizationId, requester) {

  const isPersonAdmin = await organization_admin_model.isPersonAdmin(requester, organizationId);
  if(isPersonAdmin){
    await knex('OrganizationAdministrator')
    .insert({
      id_person: personId,
      id_organization: organizationId
    });
    return true;
  }
  return false;
}

/**
 * Remove Person from the Organization's administrators.
 * If no more Administrators are left, the Organization is removed.
 * @param {*} personId
 * @param {*} organizationId
 */
async function removeOrganizationAdmin (personId, organizationId) {
  const transaction = await knex.transaction();

  // We lock the table to ensure that we won't have concurrency issues
  // while checking remainingAdministrators.
  // TODO: Understand whether a lock on the table is really necessary
  await transaction.raw('LOCK TABLE "OrganizationAdministrator" IN SHARE MODE');

  await transaction('OrganizationAdministrator')
    .where('id_person', personId)
    .where('id_organization', organizationId)
    .del();

  // TODO: If the user instead deletes their entire profile, the organization will not be deleted. Fix. (database schema)
  const remainingAdministrators = await transaction('OrganizationAdministrator')
    .where({ id_organization: organizationId });

  if (remainingAdministrators.length === 0) {
    // If no more users, delete the organization
    await transaction('Organization')
      .where('id', organizationId)
      .del();
  }

  await transaction.commit();
}

module.exports = {
  isPersonOrganizationAdministrator,
  addOrganizationAdministrator,
  removeOrganizationAdmin
};
