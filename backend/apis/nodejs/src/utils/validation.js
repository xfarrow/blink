/**
 * Checks whether an e-mail is in a valid format
 * @param {*} email email to validate 
 * @returns true or false
 */
function validateEmail(email) {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
}
  
/**
 * Checks whether a date is in a correct Postgres
 * format (YYYY-MM-DD)
 * @param {*} dateString the date to validate 
 * @returns true or false
 */
function isPostgresDateFormatValid(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
}

module.exports = {
    validateEmail,
    isPostgresDateFormatValid
};