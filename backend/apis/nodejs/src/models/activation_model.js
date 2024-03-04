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

/**
 * Get a Person's ID by its activation identifier
 * @param {*} identifier 
 * @returns 
 */
async function getPersonIdByIdentifier (identifier){
    const tuple = await knex('ActivationLink')
    .where('identifier', identifier)
    .first();
    if(tuple){
        return tuple.person_id;
    }
    return null;
}

module.exports = {
    getPersonIdByIdentifier
};