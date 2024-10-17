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

const createOrganizationValidator = [
    check('name').trim().notEmpty().escape().isLength({
        max: 128
    }),
    check('location').trim().escape().isLength({
        max: 256
    }),
    check('description').optional().trim().escape(),
    check('isHiring').optional().isBoolean()
];

const updateOrganizationValidator = [
    check('name').trim().notEmpty().escape().isLength({
        max: 128
    }),
    check('location').trim().escape().isLength({
        max: 256
    }),
    check('description').optional().trim().escape(),
    check('isHiring').optional().isBoolean()
];

const deleteOrGetOrganizationValidator = [
    check('id').notEmpty().escape()
]

const filterValidator = [
    check('name').trim().notEmpty().escape().isLength({
        min: 3, // to avoid database overhead
        max: 128
    }).withMessage('The name must be at least 3 characters and cannot exceed 128')
]

module.exports = {
    validationResult,
    createOrganizationValidator,
    updateOrganizationValidator,
    deleteOrGetOrganizationValidator,
    filterValidator
}