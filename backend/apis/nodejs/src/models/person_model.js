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
 * @param {*} displayName
 * @param {*} dateOfBirth
 * @param {*} available
 * @param {*} enabled
 * @param {*} placeOfLiving
 * @returns
 */
function createPerson(email, password, displayName, dateOfBirth, placeOfLiving, aboutMe, qualification, openToWork, enabled) {
  const person = {
    email: email.toLowerCase(),
    password,
    display_name: displayName,
    date_of_birth: dateOfBirth,
    open_to_work: openToWork,
    place_of_living: placeOfLiving,
    about_me: aboutMe,
    qualification,
    enabled,
    visibility: "EVERYONE"
  };
  return person;
}

/**
 * Returns the Person specified by their e-mail
 * @param {*} email email to look the Person for
 * @returns the Person object
 */
async function findByEmail(email) {
  return await knex('Person')
    .where('email', email.toLowerCase())
    .first();
}

/**
 * Get Person by Id
 * @param {*} id - The id to look the person for
 * @returns
 */
async function findById(id) {
  return await knex('Person')
    .select('*')
    .where({
      id
    })
    .first();
}

/**
 * Registers a Person by inserting in the database, in a transaction,
 * both in the "Person" and in the "ActivationLink" tables.
 * @param {*} person A Person object
 * @param {*} activationLink the activationLink identifier, if null, it won't be inserted
 * 
 * @returns The inserted person.
 */
async function insert(person, activationLink) {
  // We need to insert either both in the "Person" table
  // and in the "ActivationLink" one, or in neither
  return await knex.transaction(async (tr) => {
    const insertedPerson = await tr('Person')
      .insert(person)
      .returning('*');
    if (activationLink != null) {
      await tr('ActivationLink')
        .insert({
          person_id: insertedPerson[0].id,
          identifier: activationLink
        });
    }
    return insertedPerson[0];
  });
}

/**
 * Gets a Person by specifying email and password.
 * Used for log-in
 * @param {*} email
 * @param {*} password
 * @returns
 */
async function authenticate(email, password) {
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
async function update(person, person_id) {
  await knex('Person')
    .where('id', person_id)
    .update(person);
}

/**
 * Deletes a Person specified by its database id.
 * @param {*} person_id
 */
async function remove(personId) {
  await knex('Person')
    .where({
      id: personId
    })
    .del();
}

async function confirmActivation(personId) {
  await knex.transaction(async (tr) => {
    await tr('Person')
      .where('id', personId)
      .update({
        enabled: true
      });

    await tr('ActivationLink')
      .where('person_id', personId)
      .del();
  });
}

// Exporting a function
// means making a JavaScript function defined in one
// module available for use in another module.
module.exports = {
  createPerson,
  findByEmail,
  findById,
  authenticate,
  insert,
  update,
  remove,
  confirmActivation
};