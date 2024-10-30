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

const {
    check,
    validationResult
  } = require("express-validator"); // This is the destructuring part. It specifies which properties of the imported object (express-validator) you want to extract.

  const {
    escape
} = require('validator');
  
const insertValidator = [
    check('idJobOffer').trim().escape().isInt()
];

const findValidator = [
    check('idApplication').trim().escape().isInt()
];

const myApplicationsValidator = [
    check('organizationId').optional().trim().escape().isInt()
];

const getApplicationsByJobOfferValidator = [
    check('idJobOffer').trim().escape().isInt()
];

const getApplicationsByOrganizationValidator = [
    check('idOrganization').trim().escape().isInt()
];

const removeValidator = [
    check('idApplication').trim().escape().isInt()
];

const setStatusValidator = [
    check('idApplication').trim().escape().isInt(),
    check('status').trim().escape().isIn(['ACCEPTED', 'REJECTED']).withMessage('Invalid status. Status must be ACCEPTED or REJECTED')
];

module.exports = {
    insertValidator,
    findValidator,
    myApplicationsValidator,
    getApplicationsByJobOfferValidator,
    getApplicationsByOrganizationValidator,
    removeValidator,
    setStatusValidator,
    validationResult
}