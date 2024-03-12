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
    check('description').trim().escape(),
    check('is_hiring').isBoolean()
];

const updateOrganizationValidator = [
    check('name').trim().notEmpty().escape().isLength({
        max: 128
    }),
    check('location').trim().escape().isLength({
        max: 256
    }),
    check('description').trim().escape(),
    check('is_hiring').optional().isBoolean()
];

const deleteOrGetOrganizationValidator = [
    check('id').notEmpty().escape()
]

module.exports = {
    validationResult,
    createOrganizationValidator,
    updateOrganizationValidator,
    deleteOrGetOrganizationValidator
}