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

async function insert(req, res) {
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
        console.error(`Error in function ${insert.name}: ${error}`);
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
}

async function find(req, res) {
    try {
        const experience = await Experience.find(req.params.experienceId);
        if (experience == null) {
            return res.status(404).send();
        }
        return res.status(200).json(experience);
    } catch (error) {
        console.error(`Error in function ${find.name}: ${error}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}

async function remove(req, res) {
    try {
        await Experience.remove(req.params.experienceId, req.jwt.person_id);
        return res.status(204).send();
    } catch (error) {
        console.error(`Error in function ${remove.name}: ${error}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}

async function update(req, res) {
    try {
        const updatedExperience = {};
        updatedExperience.person_id = req.jwt.person_id;
        updatedExperience.id = req.params.experienceId;

        if (req.body.title !== undefined) {
            updatedExperience.title = req.body.title;
        }

        if (req.body.description !== undefined) {
            updatedExperience.description = req.body.description;
        }

        if (req.body.organizationId !== undefined ^ req.body.organizationName !== undefined) {
            if (req.body.organizationId !== undefined) {
                updatedExperience.organizationId = req.body.organizationId;
            } else {
                updatedExperience.organizationName = req.body.organizationName;
            }
        }

        if (req.body.date !== undefined) {
            updatedExperience.date = req.body.date;
        }

        if (req.body.type !== undefined) {
            updatedExperience.type = req.body.type;
        }

        if (Object.keys(updatedExperience).length === 2) { // 2 because at least person_id and id are set
            return res.status(400).json({
                error: 'Bad request. No data to update'
            });
        }

        Experience.update(updatedExperience);
        return res.status(204).send();

    } catch (error) {
        console.error(`Error in function ${update.name}: ${error}`);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}

const routes = express.Router();
routes.post('/', jwtUtils.extractToken, insert);
routes.get('/:experienceId', jwtUtils.extractToken, find);
routes.delete('/:experienceId', jwtUtils.extractToken, remove);
routes.patch('/:experienceId', jwtUtils.extractToken, update);

module.exports = {
    routes
};