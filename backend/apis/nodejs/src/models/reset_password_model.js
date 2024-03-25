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

const knex = require('../utils/knex_config');

async function add(email, secret) {
    await knex('RequestResetPassword')
        .insert({
            email,
            secret
        });
}

async function findBySecret(secret) {
    return await knex('RequestResetPassword').where({
        secret
    }).first();
}

/**
 * Given a secret and a new password, update the Peron's personal password
 *
 * @param {*} password The new (hashed) password
 * @param {*} secret The secret received via e-mail (table RequestResetPassword)
 * @returns 
 */
async function resetPassword(password, secret) {
    const request = await findBySecret(secret); //TODO should we avoid another db call by directly passing the email?
    if (!request) {
        return;
    }
    await knex.transaction(async tr => {
        await tr('Person').where({
            email: request.email
        }).update({
            password
        });

        // Delete all the requests associated with that e-mail
        await tr('RequestResetPassword').where({
            email
        }).del();
    });
}

module.exports = {
    add,
    findBySecret,
    resetPassword
}