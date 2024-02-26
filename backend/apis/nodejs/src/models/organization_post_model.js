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
 * Create OrganizationPost object
 * @param {*} organizationId
 * @param {*} content
 * @param {*} originalAuthor
 */
function organizationPost (organizationId, content, originalAuthor) {
  const organizationPost = {
    organization_id: organizationId,
    content,
    original_author: originalAuthor
  };
  return organizationPost;
}

/**
 * Insert an OrganizationPost if and only if the author is
 * one of the Organization's administrators.
 * @param {*} organization
 * @returns the inserted OrganizationPost
 */
async function insertOrganizationPost (organization) {
  const isOrganizationAdmin = await knex('OrganizationAdministrator')
    .where('id_person', organization.original_author)
    .where('id_organization', organization.organization_id)
    .select('*')
    .first();

  // Non-exploitable TOC/TOU weakness
  // For more information https://softwareengineering.stackexchange.com/questions/451038/when-should-i-be-worried-of-time-of-check-time-of-use-vulnerabilities-during-dat
  if (!isOrganizationAdmin) {
    return false;
  }

  const organizationPost = await knex('OrganizationPost')
    .insert({
      organization_id: organization.organization_id,
      content: organization.content,
      original_author: organization.original_author
    })
    .returning('*');

  return organizationPost[0];
}

/**
 * Checks whether the specified Person is an Organization Administrator
 * of the Organization the Post belongs to.
 * @param {*} postId
 * @param {*} personId
 * @returns true or false
 */
async function isPersonPostAdministrator (postId, personId) {
  return await knex('OrganizationPost')
    .join('OrganizationAdministrator', 'OrganizationPost.organization_id', 'OrganizationAdministrator.id_organization')
    .where('OrganizationPost.id', postId)
    .where('OrganizationAdministrator.id_person', personId)
    .select('*')
    .first();
}

/**
 * Deletes the specified OrganizationPost if the requester is one
 * of the Administrators of the Organization the Post belongs to
 * @param {*} postId Id of the Post to delete
 * @param {*} requester Id of the Person requesting the deletion
 */
async function deleteOrganizationPost (postId, requester) {
  if(await isPersonPostAdministrator(postId, requester)){
    return await knex('OrganizationPost')
    .where('id', postId)
    .del() == 1;
  }
  return false;
}

module.exports = {
  organizationPost,
  insertOrganizationPost,
  isPersonPostAdministrator,
  deleteOrganizationPost
};
