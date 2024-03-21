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
const Tag = require('../models/tags_model');

/**
 * POST Request
 * 
 * Creates a new Job Offer
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function insert(req, res) {
    try {
        const tags = await Tag.findByTags(req.body.tags);
        const insertedJobOffer = await JobOffer.insert(
            req.jwt.person_id,
            req.params.id, // organization id
            req.body.title,
            req.body.description,
            req.body.requirements,
            req.body.salary,
            req.body.salary_frequency,
            req.body.salary_currency,
            req.body.location,
            tags);

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

/**
 * DELETE Request
 * 
 * Removes a Job Offer
 * @param {*} req 
 * @param {*} res 
 */
async function remove(req, res) {
    try {
        const result = await JobOffer.remove(req.jwt.person_id, req.params.jobOfferId);
        if (result) {
            return res.status(204).send();
        } else {
            return res.status(403).json({
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

/**
 * GET Request
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function findByOrganizationId(req, res) {
    try {
        const result = await JobOffer.findByOrganizationId(req.params.id);
        return res.status(200).send(result);
    } catch (error) {
        console.error(`Error in function ${insert.name}: ${error}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}

const routes = express.Router();
routes.get('/:id/joboffers', findByOrganizationId);
routes.post('/:id/joboffers', jwtUtils.extractToken, insert);
routes.delete('/joboffers/:jobOfferId', jwtUtils.extractToken, remove);

module.exports = {
    routes
}