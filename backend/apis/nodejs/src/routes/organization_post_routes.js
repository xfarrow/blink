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
   * Creates a Post belonging to an organization
   *
   * Required field(s): organization_id, content
   * @returns the inserted Post 
   */
async function createOrganizationPost(req, res){

    // Ensure that the required fields are present before proceeding
    if (!req.body.organization_id || !req.body.content) {
      return res.status(400).json({ error : "Invalid request"});
    }
  
    try {
      // Check if the current user is a organization's administrator
      const isOrganizationAdmin = await knex('OrganizationAdministrator')
      .where('id_person', req.jwt.person_id)
      .where('id_organization', req.body.organization_id)
      .select('*')
      .first();
      
      // Non-exploitable TOC/TOU weakness
      // For more information https://softwareengineering.stackexchange.com/questions/451038/when-should-i-be-worried-of-time-of-check-time-of-use-vulnerabilities-during-dat
      if(!isOrganizationAdmin){
        return res.status(403).json({error : "Forbidden"});
      }
  
      const organizationPost = await knex('OrganizationPost')
      .insert({
        organization_id: req.body.organization_id,
        content: req.body.content,
        original_author: req.jwt.person_id
      })
      .returning('*');
      return res.status(200).json(organizationPost[0]);
    } 
    catch (error) {
      console.log("Error while creating Organization Post: " + error);
      return res.status(500).json({error : "Internal server error"});
    }
  }

/**
 * DELETE Request
 * 
 * Deletes a Post belonging to an Organization, only if
 * the logged user is an administrator of that Organization.
 * 
 * Required field(s): none.
 */
async function deleteOrganizationPost(req, res){

  const organizationPostIdToDelete = req.params.id;

  try{
    const isOrganizationAdmin = await knex('OrganizationPost')
      .join('OrganizationAdministrator', 'OrganizationPost.organization_id', 'OrganizationAdministrator.id_organization')
      .where('OrganizationPost.id', organizationPostIdToDelete)
      .where('OrganizationAdministrator.id_person', req.jwt.person_id)
      .select('*')
      .first();

      // Unexploitable TOC/TOU
      if(isOrganizationAdmin){
        await knex('OrganizationPost')
          .where('id', organizationPostIdToDelete)
          .del();
        return res.status(200).json({success : true});
      }
      else{
        return res.status(401).json({error : "Forbidden"});
      }
  }
  catch (error) {
    console.log(error);
    res.status(500).json({error : "Internal server error"});
  }
}

// Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
module.exports = {
    createOrganizationPost,
    deleteOrganizationPost
};