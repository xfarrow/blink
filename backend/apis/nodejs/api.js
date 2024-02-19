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

// Importing modules
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const apiController = require('./controllers/api_controller.js');
require('dotenv').config();

// Application configuration
const app = express();
app.use(express.json()); // Middleware which parses JSON for POST requests
app.use(cors()); // Enable CORS for all routes
app.use(rateLimit({
  windowMs: process.env.LIMITER_WINDOW,
  max: process.env.LIMITER_MAXIMUM_PER_WINDOW,
  message: {error : "Too many requests from this IP, please try again later"}
})); // Apply the rate limiter middleware to all routes

const publicRoutes = express.Router();
publicRoutes.post('/register', apiController.registerPerson);
publicRoutes.post('/login', apiController.login);

const protectedRoutes = express.Router();
protectedRoutes.use(apiController.verifyToken);
protectedRoutes.get('/person/myself', apiController.getMyself);
protectedRoutes.get('/person/:id', apiController.getPerson);
protectedRoutes.put('/person/:id', apiController.updatePerson);
protectedRoutes.delete('/person/delete', apiController.deletePerson);
protectedRoutes.post('/organization/admin', apiController.addOrganizationAdmin);
protectedRoutes.delete('/organization/removeadmin', apiController.removeOrganizationAdmin);
protectedRoutes.post('/organization', apiController.createOrganization);
protectedRoutes.get('/organization/:id', apiController.getOrganization);
protectedRoutes.put('/organization/:id', apiController.updateOrganization);
protectedRoutes.delete('/organization/:id', apiController.deleteOrganization);
protectedRoutes.post('/organization/post', apiController.createOrganizationPost);
protectedRoutes.delete('/organization/post/:id', apiController.deleteOrganizationPost);

// Mounting routes
app.use('/api', publicRoutes); // Routes not requiring token
app.use('/api', protectedRoutes); // Routes requiring token

// Start the server
app.listen(process.env.API_SERVER_PORT, () => {
  console.log(`Blink API server is running on port ${process.env.API_SERVER_PORT}`);
});