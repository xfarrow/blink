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

const registerValidator = [
  check('display_name').trim().notEmpty().escape().isLength({
    max: 128
  }),
  check('email').isEmail().normalizeEmail().escape().isLength({
    max: 128
  }),
  check('password').isLength({
    min: 5
  }).trim().escape().withMessage('Password must be at leat 5 characters long'),
  check('date_of_birth').optional().isDate().withMessage('Invalid date format. Date must be YYYY-MM-DD'),
  check('available').optional().isBoolean(),
  check('place_of_living').isLength({
    max: 128
  }).escape(),
  check('about_me').isLength({
    max: 4096
  }).escape(),
  check('qualification').isLength({
    max: 64
  }).escape(),
];

const getTokenValidator = [
  check('email').isEmail().normalizeEmail().escape(),
  check('password').notEmpty().trim().escape()
];

module.exports = {
  registerValidator,
  getTokenValidator,
  validationResult
};