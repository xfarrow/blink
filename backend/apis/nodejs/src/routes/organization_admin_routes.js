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
const organization_admin_model = require('../models/organization_admin_model');

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
      const isPersonAdmin = await organization_admin_model.isPersonAdmin(req.jwt.person_id, req.body.organization_id);
      // TOC/TOU
      if(!isPersonAdmin){
        return res.status(401).json({error : "Forbidden"});
      }
      await organization_admin_model.addOrganizationAdministrator(req.body.person_id, req.body.organization_id);
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
        await organization_admin_model.removeOrganizationAdmin(req.jwt.person_id, req.body.organization_id);
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