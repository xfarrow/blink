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
 * POST Request
 * 
 * Creates an Organization and its Administrator.
 * 
 * Required field(s): name
 *
 * @returns the inserted organization
 */
async function createOrganization(req, res){
  
    // Ensure that the required fields are present before proceeding
    if (!req.body.name) {
      return res.status(400).json({ error : "Invalid request"});
    }
  
    try{
      const insertedOrganization = await knex.transaction(async (trx) => {
  
        // We have to insert either both in Organization and in OrganizationAdministrator
        // or in neither
        const organizationResult = await trx('Organization')
          .insert({
            name: req.body.name,
            location: req.body.location,
            description: req.body.description,
            is_hiring: req.body.is_hiring,
          }, '*');
  
        // Inserting in the "OrganizationAdministrator" table
        await trx('OrganizationAdministrator')
          .insert({
            id_person: req.jwt.person_id,
            id_organization: organizationResult[0].id,
          });
        return organizationResult[0];
      });
      return res.status(200).json({ Organization: insertedOrganization });
    }
    catch (error){
      console.error('Error creating Organization:', error);
      res.status(500).json({error : "Internal server error"});
    }
  }
  
  /**
   * PUT Request
   * Updates an Organization's details
   *
   * Required field(s): none.
   */
  async function updateOrganization(req, res){
  
    const updateOrganization = {};
  
    if(req.body.name){
      updateOrganization.name = req.body.name;
    }
  
    if(req.body.location){
      updateOrganization.location = req.body.location;
    }
  
    if(req.body.description){
      updateOrganization.description = req.body.description;
    }
  
    if(req.body.is_hiring){
      updateOrganization.is_hiring = req.body.is_hiring;
    }
  
    if (Object.keys(updateOrganization).length === 0) {
      return res.status(400).json({ error : "Bad request. No data to update"});
    }
  
    try {
  
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
      // //   is_hiring: req.body.is_hiring
      // // });
  
      const updatedRows = await knex('Organization')
      .where('id', req.params.id)
      .whereExists(function(){
        this.select('*')
          .from('OrganizationAdministrator')
          .where('id_person', req.jwt.person_id)
          .where('id_organization', req.params.id)
      })
      .update({
        name: req.body.name,
        location: req.body.location,
        description: req.body.description,
        is_hiring: req.body.is_hiring
      });
  
      if(updatedRows == 1){
        return res.status(200).json({ success : "true"});
      }
      else{
        return res.status(404).json({error : "Organization either not found or insufficient permissions"});
      }
    } 
    catch (error) {
      console.log(error);
      return res.status(500).json({error : "Internal server error"});
    }
  }
  
  /**
   * DELETE Request
   * 
   * Deletes the specified organization if the logged user is
   * one of its administrator 
   */
  async function deleteOrganization(req, res){
    const organizationIdToDelete = req.params.id;
  
    try {
  
      // Delete organization if admin
      const deletedRows = await knex('Organization')
        .where({ id: organizationIdToDelete })
        .whereExists(function(){
          this.select('*')
            .from('OrganizationAdministrator')
            .where('id_person', req.jwt.person_id)
            .where('id_organization', organizationIdToDelete)
        })
        .del();
  
      if(deletedRows == 0){
        return res.status(403).json({error: "Forbidden"});
      }
      else{
        return res.status(200).json({success: true});
      }
        
    }
    catch (error) {
      console.error(error);
      return res.status(500).json({error : "Internal server error"});
    }
  }
  
  /**
   * GET Request
   * 
   * Obtains an organization by its identifier.
   * 
   * Required field(s): none.
   * 
   * @returns the organization.
   */
  async function getOrganization(req, res){
    const organizationId = req.params.id;
    try {
      const organization = await knex('Organization')
        .where('id', organizationId)
        .select('*')
        .first();
      if(organization) {
        return res.status(200).json(organization);
      }
      else{
        return res.status(404).json({error : "Not found"});
      }
    }
    catch (error) {
      console.error("Error retrieving an organization: " + error);
      return res.status(500).json({error : "Internal server error"});
    }
  }

  module.exports = {
    createOrganization,
    getOrganization,
    updateOrganization,
    deleteOrganization
};

