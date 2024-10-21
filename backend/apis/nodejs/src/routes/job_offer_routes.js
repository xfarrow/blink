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
const jobOfferValidator = require('../utils/validators/job_offer_validator');

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
        const errors = jobOfferValidator.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const tags = await Tag.findByTags(req.body.tags);

        let salaryMin = null;
        let salaryMax = null;
        if (req.body.salary != null && req.body.salary.length >= 1) {
            salaryMin = req.body.salary[0];
            if (req.body.salary.length == 2) {
                salaryMax = req.body.salary[1];
            } else {
                salaryMax = salaryMin;
            }
        }

        const insertedJobOffer = await JobOffer.insert(
            req.jwt.person_id,
            req.params.id, // organization id
            req.body.title,
            req.body.description,
            salaryMin,
            salaryMax,
            req.body.salaryFrequency,
            req.body.salaryCurrency,
            req.body.location,
            req.body.remote,
            req.body.contractType,
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
        const errors = jobOfferValidator.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

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
        const errors = jobOfferValidator.validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

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
routes.post('/:id/joboffers', jobOfferValidator.insertValidator, jwtUtils.extractToken, insert);
routes.delete('/joboffers/:jobOfferId', jobOfferValidator.removeValidator, jwtUtils.extractToken, remove);
routes.get('/:id/joboffers', jobOfferValidator.findByOrganizationIdValidator, findByOrganizationId);

module.exports = {
    routes
}