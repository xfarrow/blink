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

const organization_model = require('../models/organization_model');

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
    const organization = organization_model.organization(req.body.name, req.body.location, req.body.description, req.body.is_hiring);
    await organization_model.insertOrganization(organization, req.jwt.person_id);
    return res.status(200).json({ Organization: organization });
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
    const isUpdateSuccessful = organization_model.updateOrganizationIfAdministrator(updateOrganization, req.params.id, req.jwt.person_id);
    if(isUpdateSuccessful){
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
  try {
    const isDeleteSuccessful = organization_model.deleteOrganizationIfAdmin(req.params.id, req.jwt.person_id);
    if(isDeleteSuccessful){
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
  try {
    const organization = await organization_model.getOrganizationById(req.params.id);
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

