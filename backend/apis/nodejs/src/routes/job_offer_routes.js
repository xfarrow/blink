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

const JobOffer = require('../models/job_offer_model');
const jwtUtils = require('../utils/jwt_utils');
const express = require('express');

async function insert(req, res) {
    try {
        const insertedJobOffer = await JobOffer.insert(
            req.jwt.person_id,
            req.body.organization_id,
            req.body.title,
            req.body.description,
            req.body.requirements,
            req.body.salary,
            req.body.salary_frequency,
            req.body.location);

        if (insertedJobOffer) {
            res.set('Location', `/api/joboffers/${insertedJobOffer.id}`);
            return res.status(201).json(insertedJobOffer);
        } else {
            return res.status(401).json({
                error: 'Forbidden'
            });
        }
    } catch (error) {
        console.error(`Error in function ${insert.name}: ${error}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}

const protectedRoutes = express.Router(); // Routes requiring token
protectedRoutes.use(jwtUtils.verifyToken);
protectedRoutes.post('/joboffers', insert);

module.exports = {
    protectedRoutes
}