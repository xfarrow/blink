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
const {
    escape
} = require('validator');

const insertValidator = [
    check('id').trim().notEmpty().escape(),
    check('title').trim().notEmpty().escape().isLength({
        max: 2048
    }),
    check('description').optional().trim().escape().isLength({
        max: 4096
    }),
    check('salary').optional().isArray().withMessage('Salary must be an array').custom((value) => {
        if (value.length < 1 || value.length > 2) {
          throw new Error('Salary array must have between 1 and 2 elements');
        }
        if (value !== null && !value.every((element) => typeof element === 'number')) {
            throw new Error('Salary array elements must be numbers');
        }
        return true;
      }),
    check('salaryFrequency').trim().notEmpty().escape().isLength({
        max: 64
    }),
    check('salaryCurrency').optional().trim().notEmpty().escape().isLength({
        max: 64
    }),
    check('location').optional().trim().escape().isLength({
        max: 256
    }),
    check('remote').optional().trim().escape().isLength({
        max: 256
    }),
    check('contractType').trim().escape().isLength({
        max: 256
    }),
    check('tags').optional().custom(tags => {
        if (!Array.isArray(tags)) {
            throw new Error('tags must be an array');
        }
        return true;
    }).customSanitizer(tags => {
        if (Array.isArray(tags)) {
            return tags.map(element => escape(element));
        }
    })
];

const removeValidator = [
    check('jobOfferId').trim().notEmpty().escape()
]

const findByOrganizationIdValidator = [
    check('id').trim().notEmpty().escape()
]

module.exports = {
    validationResult,
    insertValidator,
    removeValidator,
    findByOrganizationIdValidator
}