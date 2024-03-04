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
===== BEGIN IMPORTING MODULES
*/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const personRoutes = require('./routes/person_routes.js');
const organizationRoutes = require('./routes/organization_routes.js');
const organizationAdminRoutes = require('./routes/organization_admin_routes.js');
const organizationPostRoutes = require('./routes/organization_post_routes.js');

/*
===== END IMPORTING MODULES
*/

/*
===== BEGIN APPLICATION CONFIGURATION
*/

const app = express();
app.use(express.json()); // Middleware which parses JSON for POST requests
app.use(cors()); // Enable CORS for all routes
app.use(rateLimit({
  windowMs: process.env.LIMITER_WINDOW,
  max: process.env.LIMITER_MAXIMUM_PER_WINDOW,
  message: { error: 'Too many requests from this IP, please try again later' }
})); // Apply the rate limiter middleware to all routes

/*
===== END APPLICATION CONFIGURATION
*/

/*
===== BEGIN ROUTE HANDLING =====
*/

app.use('/api', personRoutes.publicRoutes);
app.use('/api', organizationRoutes.publicRoutes);
app.use('/api', personRoutes.protectedRoutes);
app.use('/api', organizationRoutes.protectedRoutes);
app.use('/api', organizationAdminRoutes.protectedRoutes);
app.use('/api', organizationPostRoutes.protectedRoutes);

/*
===== END ROUTE HANDLING =====
*/

// Do not start the server in testing environment
// It will be started by the test suite
if (process.argv[2] != 'testing') {
  // Start the server
  // Default port is 3000
  const port = process.env.API_SERVER_PORT || 3000;
  app.listen(port, () => {
    console.log(`Blink API server is running on port ${port}`);
  });
}

// Export the app for testing purposes
module.exports = app;
