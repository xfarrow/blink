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
const api_controller = require('./api_controller.js');
require('dotenv').config();

const app = express();
app.use(express.json()); // Middleware which parses JSON for POST requests
app.post('/blinkapi/register', api_controller.registerPerson); // Register a Person
app.post('/blinkapi/login', api_controller.login); // Login
app.get('/blinkapi/person/:id', api_controller.verifyToken, api_controller.getPerson); // Obtain Person's details
app.post('/blinkapi/organization', api_controller.verifyToken, api_controller.createOrganization); // Create organization
app.delete('/blinkapi/organization/:id', api_controller.verifyToken, api_controller.deleteOrganization); // Delete organization
app.post('/blinkapi/organization/post', api_controller.verifyToken, api_controller.createOrganizationPost); // Create a organization's post

// Start the server
app.listen(process.env.API_SERVER_PORT, () => {
  console.log(`Blink API server is running on port ${process.env.API_SERVER_PORT}`);
});