const jwt = require('jsonwebtoken');

function generateToken(person_id) {
    // The payload the JWT will carry within itself
    const payload = {
      person_id: person_id
    };
  
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { 
      expiresIn: '8h' 
    });
    return token;
  }
  
  // Middlware
  function verifyToken(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).send({error : 'No token provided'});
    }
  
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).send({error : 'Failed to authenticate token'});
      }
  
      // If the token is valid, store the decoded data in the request object
      req.jwt = decoded;
      next();
    });
  }

  module.exports = {
    generateToken,
    verifyToken
};