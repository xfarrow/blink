/*

    This code is part of Blink
    licensed under GPLv3

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
    IMPLIED,  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pgp = require('pg-promise')();
const Pool = require('pg-pool');

const database_configuration = {
  host: "localhost",
  port: 5432,
  database: "Blink",
  user: "postgres",
  password: "postgres"
};

const db = pgp(database_configuration);

async function register(req, res){

    const userData = req.body;
  
    // Ensure that the required fields are present before proceeding
    if (!userData.display_name || !userData.email || !userData.password) {
      return res.status(400).json("Invalid request.");
    }

    // Generate activation link token
    const activationLink = crypto.randomBytes(16).toString('hex');

    // Hash provided password
    const hashPasswordPromise = bcrypt.hash(userData.password, 10);

    try{
        
      // Begin transaction
        await db.tx(async (t) => {
        
          // Inserting in the "Person" table
          const userInsertQuery = `
            INSERT INTO "Person" (email, password, display_name, date_of_birth, available, enabled, place_of_living)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`;
  
          const userResult = await t.one(userInsertQuery, [
            userData.email,
            await hashPasswordPromise,
            userData.display_name,
            userData.date_of_birth,
            userData.available,
            false,
            userData.place_of_living
          ]);
  
          // Inserting in the "ActivationLink" table
          const activationLinkInsertQuery = `
            INSERT INTO "ActivationLink" (person_id, identifier)
            VALUES ($1, $2)
            RETURNING *`;
  
          const activationLinkResult = await t.one(activationLinkInsertQuery, [
            userResult.id,  
            activationLink,
          ]);

          return res.status(200).json({ activationLink: activationLinkResult.identifier });

      });
    }
    catch (error){
      console.error('Error inserting data:', error);
      res.status(500).json("Internal server error");
    }
}

function login(req, res){

}

module.exports = {
    register
};