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
// TODO: clean up
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const personRoutes = require('./routes/person_routes.js')
const organizationRoutes = require('./routes/organization_routes.js')
const organizationAdminRoutes = require('./routes/organization_admin_routes.js')
const organizationPostRoutes = require('./routes/organization_post_routes.js')
const jwt_utils = require('./utils/jwt_utils.js')

// Application configuration
const app = express()
app.use(express.json()) // Middleware which parses JSON for POST requests
app.use(cors()) // Enable CORS for all routes
app.use(rateLimit({
  windowMs: process.env.LIMITER_WINDOW,
  max: process.env.LIMITER_MAXIMUM_PER_WINDOW,
  message: { error: 'Too many requests from this IP, please try again later' }
})) // Apply the rate limiter middleware to all routes

const publicRoutes = express.Router()
publicRoutes.post('/register', personRoutes.registerPerson)
publicRoutes.post('/login', personRoutes.login)

const protectedRoutes = express.Router()
protectedRoutes.use(jwt_utils.verifyToken)
protectedRoutes.get('/person/myself', personRoutes.getMyself)
protectedRoutes.get('/person/:id', personRoutes.getPerson)
protectedRoutes.put('/person/:id', personRoutes.updatePerson)
protectedRoutes.delete('/person/delete', personRoutes.deletePerson)
protectedRoutes.post('/organization/admin', organizationAdminRoutes.addOrganizationAdmin)
protectedRoutes.delete('/organization/removeadmin', organizationAdminRoutes.removeOrganizationAdmin)
protectedRoutes.post('/organization', organizationRoutes.createOrganization)
protectedRoutes.get('/organization/:id', organizationRoutes.getOrganization)
protectedRoutes.put('/organization/:id', organizationRoutes.updateOrganization)
protectedRoutes.delete('/organization/:id', organizationRoutes.deleteOrganization)
protectedRoutes.post('/organization/post', organizationPostRoutes.createOrganizationPost)
protectedRoutes.delete('/organization/post/:id', organizationPostRoutes.deleteOrganizationPost)

// Mounting routes
app.use('/api', publicRoutes) // Routes not requiring token
app.use('/api', protectedRoutes) // Routes requiring token

// Start the server. Default port is 3000
const port = process.env.API_SERVER_PORT || 3000
app.listen(port, () => {
  console.log(`Blink API server is running on port ${port}`)
})

module.exports = app
