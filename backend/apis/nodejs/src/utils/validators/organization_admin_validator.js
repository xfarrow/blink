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
} = require("express-validator");

const addOrganizationAdminValidator = [
    check('personId').trim().notEmpty().escape(),
    check('organizationId').trim().notEmpty().escape()
];

const removeOrganizationAdminValidator = [
    check('organizationId').trim().notEmpty().escape()
]

module.exports = {
    validationResult,
    addOrganizationAdminValidator,
    removeOrganizationAdminValidator
}