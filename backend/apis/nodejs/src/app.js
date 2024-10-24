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

/*
===== BEGIN IMPORTING MODULES =====
*/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimiter = require('./utils/rate_limit_utils.js');
const helmet = require('helmet')
const personRoutes = require('./routes/person_routes.js');
const organizationRoutes = require('./routes/organization_routes.js');
const organizationAdminRoutes = require('./routes/organization_admin_routes.js');
const jobOffersRoutes = require('./routes/job_offer_routes.js');
const serverRoutes = require('./routes/server_routes.js');
const resetPasswordRoutes = require('./routes/reset_password_routes.js');
const applicationRoutes = require('./routes/job_application_routes.js');

/*
===== END IMPORTING MODULES =====
*/

/*
===== BEGIN APPLICATION CONFIGURATION =====
*/

const app = express();
app.use(express.json()); // Middleware which parses JSON for POST requests
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Some security settings
app.use(rateLimiter); // Apply the rate limiter middleware to all routes

/*
===== END APPLICATION CONFIGURATION =====
*/

/*
===== BEGIN ROUTE HANDLING =====
*/
app.use('/api/server', serverRoutes.routes);
app.use('/api/persons', personRoutes.publicRoutes);
app.use('/api/persons', personRoutes.protectedRoutes);
app.use('/api/organizations', organizationRoutes.routes);
app.use('/api/organizations', jobOffersRoutes.routes);
app.use('/api/organizations', organizationAdminRoutes.routes);
app.use('/api/resetpassword', resetPasswordRoutes.routes);
app.use('/api/applications', applicationRoutes.routes);

/*
===== END ROUTE HANDLING =====
*/


/*
===== STARTING THE SERVER =====
*/

// Default port is 3000
const port = process.env.API_SERVER_PORT || 3000;
app.listen(port, () => {
  console.log(`Blink API server is running on port ${port}`);
});

/*
===== END STARTING THE SERVER =====
*/

// Export the app for testing purposes
module.exports = app;