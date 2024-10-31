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

const express = require('express');
const jwtUtils = require('../utils/jwt_utils');
const PersonContactInfo = require('../models/person_contact_info');

async function insert(req, res) {
    try {
        const contactInfo = PersonContactInfo.insert(req.jwt.person_id, req.body.content, req.body.info_type);
        res.set('Location', `/api/persons/${req.jwt.person_id}/contactinfos/${contactInfo.id}`);
        return res.status(201).json(application);
    } catch (error) {
        console.error(`Error in function ${insert.name}: ${error}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}

const routes = express.Router();
routes.post('/myself/contactinfos', jwtUtils.extractToken, insert);
module.exports = {
    routes
};