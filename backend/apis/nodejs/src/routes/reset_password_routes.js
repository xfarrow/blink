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

const Person = require('../models/person_model');
const mailUtils = require('../utils/mail_utils');
const RequestResetPassword = require('../models/reset_password_model');
const crypto = require('crypto');
const express = require('express');

async function add(req, res) {
    try {
        const userExists = await Person.findByEmail(req.body.email);
        // If the user does not exist, do not inform them of the absence
        // of the user
        if (userExists) {
            const secret = crypto.randomBytes(16).toString('hex');
            await RequestResetPassword.add(req.body.email, secret);
            mailUtils.sendMail(req.body.email, 'Blink Reset Password', secret, null);
        }
        return res.status(204).send();
    } catch (error) {
        console.error(`Error in function ${registerPerson.name}: ${error}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}

const routes = express.Router();
routes.post('/request', add);

module.exports = {
  routes
};