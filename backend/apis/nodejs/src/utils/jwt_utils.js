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

const jwt = require('jsonwebtoken');

function generateToken(person_id) {
  // The payload the JWT will carry within itself
  const payload = {
    person_id
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: '8h'
  });
  return token;
}

/**
 * Verifies the validity of the token. If it is valid,
 * sets the req.jwt property to the decoded object
 * contained within the jwt
 */
function extractToken(req, res, next) {

  const authHeader = req.headers.authorization;

  // Obtain the token using the Bearer scheme
  // The Bearer token, contained in the header, has the following
  // structure: "Bearer <jwt>"
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // If the token is valid, store the decoded data in the request object
      // req.jwt will contain the payload created in generateToken
      req.jwt = decoded;
      next();
    } catch (error) {
      return res.status(401).send({
        error: 'Failed to authenticate token'
      });
    }
  } else {
    return res.status(401).send({
      error: 'No token provided'
    });
  }
}

module.exports = {
  generateToken,
  extractToken
};