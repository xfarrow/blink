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

const Experience = require('../models/experience_model');
const express = require('express');
const jwtUtils = require('../utils/jwt_utils');

async function addExperience(req, res) {
    try {
        const experienceToInsert = Experience.createExperience(
            req.body.title,
            req.body.description,
            req.body.organizationId,
            req.body.organizationName,
            req.body.date,
            req.jwt.person_id,
            req.body.type
        )
        const insertedExperience = await Experience.insert(experienceToInsert);
        return res.status(201).json(insertedExperience);
    } catch (error) {
        console.error(`Error in function ${addExperience.name}: ${error}`);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
}

const routes = express.Router();
routes.post('/', jwtUtils.extractToken, addExperience);

module.exports = {
    routes
};