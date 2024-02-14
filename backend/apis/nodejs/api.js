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
const api_controller = require('./api_controller.js');
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

app.post('/api/register', api_controller.registerPerson); // Register a Person
app.post('/api/login', api_controller.login); // Login
app.get('/api/person/:id', api_controller.verifyToken, api_controller.getPerson); // Obtain Person's details
app.put('/api/person/:id', api_controller.verifyToken, api_controller.updatePerson); // Update Person's details
app.delete('/api/person/delete', api_controller.verifyToken, api_controller.deletePerson); // Delete a Person
app.post('/api/organization/admin', api_controller.verifyToken, api_controller.addOrganizationAdmin); // Add Organization Administrator
app.delete('/api/organization/removeadmin', api_controller.verifyToken, api_controller.removeOrganizationAdmin); // Remove Organization Administrator
app.post('/api/organization', api_controller.verifyToken, api_controller.createOrganization); // Create organization
app.get('/api/organization/:id', api_controller.verifyToken, api_controller.getOrganization); // Get Organization data
app.put('/api/organization/:id', api_controller.verifyToken, api_controller.updateOrganization); // Update organization
app.delete('/api/organization/:id', api_controller.verifyToken, api_controller.deleteOrganization); // Delete organization
app.post('/api/organization/post', api_controller.verifyToken, api_controller.createOrganizationPost); // Create a organization's post
app.delete('/api/organization/post/:id', api_controller.verifyToken, api_controller.deleteOrganizationPost); // Delete a organization's post

// Start the server
app.listen(process.env.API_SERVER_PORT, () => {
  console.log(`Blink API server is running on port ${process.env.API_SERVER_PORT}`);
});