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
const port = process.env.API_SERVER_PORT;

// Middleware which parses JSON for POST requests
app.use(express.json());

app.post('/blinkapi/register', api_controller.register);
app.post('/blinkapi/login', api_controller.login);
app.get('/blinkapi/person/:id', api_controller.verifyToken, api_controller.person);

// Start the server
app.listen(port, () => {
  console.log(`Blink API server is running on port ${port}`);
});