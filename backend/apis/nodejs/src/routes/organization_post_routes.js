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

const organizationPostModel = require('../models/organization_post_model');

/**
   * POST Request
   *
   * Creates a Post belonging to an organization
   *
   * Required field(s): organization_id, content
   * @returns the inserted Post
   */
async function createOrganizationPost (req, res) {
  // Ensure that the required fields are present before proceeding
  if (!req.body.organization_id || !req.body.content) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const organization = organizationPostModel.organizationPost(
    req.body.organization_id,
    req.body.content,
    req.jwt.person_id);

  try {
    const insertedOrganization = await organizationPostModel.insertOrganizationPost(organization);
    return res.status(200).json(insertedOrganization);
  } catch (error) {
    console.error(`Error in function ${createOrganizationPost.name}: ${error}`);
    return res.status(500).json({ error: 'Internal server error' });
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
async function deleteOrganizationPost (req, res) {
  try {
      const success = await organizationPostModel.deleteOrganizationPost(req.params.id, req.jwt.person_id);

      if(success){
        return res.status(200).json({ success: true });
      }
      return res.status(401).json({ error: 'Forbidden' });
      
  } catch (error) {
    console.error(`Error in function ${deleteOrganizationPost.name}: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
module.exports = {
  createOrganizationPost,
  deleteOrganizationPost
};
