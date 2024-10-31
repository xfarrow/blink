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

async function insert(personId, infoContent, infoType) {
    const contactInfo = await knex('PersonContactInfo')
        .insert({
            person_id: personId,
            info: infoContent,
            info_type: infoType
        })
        .returning("*");
    return contactInfo[0];
}

async function getInfoByPerson(personId) {
    return await knex('PersonContactInfo')
        .where('person_id', personId);
}

module.exports = {
    insert,
    getInfoByPerson
}