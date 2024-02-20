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
 * POST Method
 * 
 * Add an Administrator to an Organization. Allowed only if the
 * logged user is an Administrator themselves.
 * 
 * Required field(s): organization_id, person_id
 */
async function addOrganizationAdmin(req, res){

    // Ensure that the required fields are present before proceeding
    if (!req.body.organization_id || !req.body.person_id) {
      return res.status(400).json({ error : "Invalid request"});
    }
  
    try {
      const isPersonAdmin = await knex('OrganizationAdministrator')
        .where('id_person', req.jwt.person_id)
        .where('id_organization', req.body.organization_id)
        .select('*')
        .first();
  
      if(!isPersonAdmin){
        return res.status(401).json({error : "Forbidden"});
      }
  
      await knex('OrganizationAdministrator')
        .insert({
          id_person: req.body.person_id,
          id_organization: req.body.organization_id
        });
      return res.status(200).json({success : true});
    }
    catch (error) {
      console.error('Error while adding organization admin: ' + error);
      res.status(500).json({error : "Internal server error"});
    }
  }
  
  /**
   * DELETE Request
   * 
   * Deletes a Person from the list of Administrators of an Organization.
   * The logged user can only remove themselves. If no more Administrators
   * are left, the Organization is removed.
   * 
   * Required field(s): organization_id
   */
  async function removeOrganizationAdmin(req, res){
    
      // Ensure that the required fields are present before proceeding
      if (!req.body.organization_id) {
        return res.status(400).json({ error : "Invalid request"});
      }
  
      try{
        const transaction = await knex.transaction();
  
        // We lock the table to ensure that we won't have concurrency issues
        // while checking remainingAdministrators.
        // TODO: Understand whether a lock on the table is necessary
        await transaction.raw('LOCK TABLE "OrganizationAdministrator" IN SHARE MODE');
        
        await transaction('OrganizationAdministrator')
          .where('id_person', req.jwt.person_id)
          .where('id_organization', req.body.organization_id)
          .del();
  
        // TODO: If the user instead deletes their entire profile, the organization will not be deleted. Fix. (database schema)
        const remainingAdministrators = await transaction('OrganizationAdministrator')
          .where({ id_organization: req.body.organization_id });
  
        if (remainingAdministrators.length === 0) {
          // If no more users, delete the organization
          await transaction('Organization')
              .where('id', req.body.organization_id)
              .del();
        }
  
        await transaction.commit();
        return res.status(200).json({success : true});
      }
      catch (error){
        console.error(error);
        return res.status(500).json({ error: "Internal server error"});
      }
  }

  module.exports = {
    addOrganizationAdmin,
    removeOrganizationAdmin
};