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
    check('description').trim().escape().isLength({
        max: 4096
    }),
    check('requirements').trim().escape().isLength({
        max: 4096
    }),
    check('salary').trim().notEmpty().escape().isCurrency(),
    check('salary_frequency').trim().notEmpty().escape().isLength({
        max: 64
    }),
    check('salary_currency').trim().notEmpty().escape().isLength({
        max: 64
    }),
    check('location').trim().escape().isLength({
        max: 256
    }),
    check('tags').custom(tags => {
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