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

/**
 * Checks whether an e-mail is in a valid format
 * @param {*} email email to validate
 * @returns true or false
 */
function validateEmail (email) {
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return regex.test(email)
}

/**
 * Checks whether a date is in a correct Postgres
 * format (YYYY-MM-DD)
 * @param {*} dateString the date to validate
 * @returns true or false
 */
function isPostgresDateFormatValid (dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  return regex.test(dateString)
}

module.exports = {
  validateEmail,
  isPostgresDateFormatValid
}
