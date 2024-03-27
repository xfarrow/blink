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
const ResetPassword = require('../models/reset_password_model');
const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcrypt');
const resetPasswordValidator = require('../utils/validators/reset_password_validator');

async function add(req, res) {
    try {
        const errors = resetPasswordValidator.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const userExists = await Person.findByEmail(req.body.email);
        // If the user does not exist, do not inform them of the absence
        if (userExists) {
            const secret = crypto.randomBytes(16).toString('hex');
            await ResetPassword.add(req.body.email, secret);
            mailUtils.sendResetPasswordLink(req.body.email, secret);
        }
        res.status(204).send();
    } catch (error) {
        console.error(`Error in function ${registerPerson.name}: ${error}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}

async function reset(req, res) {
    try {
        const errors = resetPasswordValidator.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const requester = await ResetPassword.findBySecret(req.body.secret);
        if (requester) {
            const diffMilliseconds = Date.now() - requester.time_of_request.getTime();
            // Check whether the request was not performed more than 30 minutes ago
            if (diffMilliseconds / (1000 * 60) <= 30) {
                const newPassword = await bcrypt.hash(req.body.password.trim(), 10);
                await ResetPassword.resetPassword(newPassword, req.body.secret);
                return res.status(204).send();
            }
        }
        return res.status(400).send("Request either invalid or expired");

    } catch (error) {
        console.error(`Error in function ${reset.name}: ${error}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}

const routes = express.Router();
routes.post('/request', resetPasswordValidator.addRequestValidator, add);
routes.post('/reset', resetPasswordValidator.resetPasswordValidator, reset);

module.exports = {
    routes
};