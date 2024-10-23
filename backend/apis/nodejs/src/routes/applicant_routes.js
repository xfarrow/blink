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

const Applicant = require('../models/applicant_model');
const express = require('express');
const jwtUtils = require('../utils/jwt_utils');

/**
 * POST
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function insert(req, res) {
    try {
        if(await Applicant.userAlreadyApplicated(req.jwt.person_id, req.body.jobOfferId)){
            return res.status(401).json({
                error: 'User has already applied to this job'
              });
        }
        const application = await Applicant.insert(req.jwt.person_id, req.body.jobOfferId);
        res.set('Location', `/api/applications/${application.id}`);
      return res.status(201).json(application);
    } catch (error) {
      console.error(`Error in function ${registerPerson.name}: ${error}`);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  const routes = express.Router();
  routes.post('/', jwtUtils.extractToken, insert);

  module.exports = {
    routes
  };