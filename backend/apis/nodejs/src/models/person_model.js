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

const knex = require('../utils/knex_config');
const bcrypt = require('bcrypt');

/**
 * Creates Person object by the specified fields
 * @param {*} email
 * @param {*} password
 * @param {*} display_name
 * @param {*} date_of_birth
 * @param {*} available
 * @param {*} enabled
 * @param {*} place_of_living
 * @returns
 */
function person (email, password, display_name, date_of_birth, available, enabled, place_of_living) {
  const person = {
    email: email.toLowerCase(),
    password,
    display_name,
    date_of_birth,
    available,
    enabled,
    place_of_living
  };
  return person;
}

/**
 * Returns the Person specified by their e-mail
 * @param {*} email email to look the Person for
 * @returns the Person object
 */
async function getPersonByEmail (email) {
  return await knex('Person')
    .where('email', email.toLowerCase())
    .first();
}

/**
 * Get Person by Id
 * @param {*} id - The id to look the person for
 * @returns
 */
async function getPersonById (id) {
  return await knex('Person')
    .select('*')
    .where({ id })
    .first();
}

/**
 * Registers a Person by inserting in the database, in a transaction,
 * both in the "Person" and in the "ActivationLink" tables.
 * @param {*} person A Person object
 * @param {*} activationLink the activationLink identifier
 */
async function registerPerson (person, activationLink) {
  // We need to insert either both in the "Person" table
  // and in the "ActivationLink" one, or in neither
  await knex.transaction(async (tr) => {
    const personIdResult = await tr('Person')
      .insert({
        email: person.email.toLowerCase(),
        password: person.password,
        display_name: person.display_name,
        date_of_birth: person.date_of_birth,
        available: person.available,
        enabled: person.enabled,
        place_of_living: person.place_of_living
      })
      .returning('id');
    await tr('ActivationLink')
      .insert({
        person_id: personIdResult[0].id,
        identifier: activationLink
      });
  });
}

/**
 * Gets a Person by specifying email and password.
 * Used for log-in
 * @param {*} email
 * @param {*} password
 * @returns
 */
async function getPersonByEmailAndPassword (email, password) {
  const person = await knex('Person')
    .where('email', email.toLowerCase())
    .where('enabled', true)
    .select('*')
    .first();

  if (person) {
    const passwordMatches = await bcrypt.compare(password, person.password);
    if (passwordMatches) {
      return person;
    }
  }
  return null;
}

/**
 * Update a Person
 * @param {*} person The Person to update
 * @param {*} person_id The database id of the Person to update
 */
async function updatePerson (person, person_id) {
  await knex('Person')
    .where('id', person_id)
    .update(person);
}

/**
 * Deletes a Person specified by its database id.
 * @param {*} person_id
 */
async function deletePerson (person_id) {
  await knex('Person')
    .where({ id: person_id })
    .del();
}

// Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
module.exports = {
  person,
  getPersonByEmail,
  getPersonById,
  getPersonByEmailAndPassword,
  registerPerson,
  updatePerson,
  deletePerson
};
