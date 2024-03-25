function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

/**
 * Validates an e-mail using a RegExpression
 *
 * @param {*} email
 * @returns 
 */
function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
}

function callbackErrors(errors, func) {
    errors.forEach(error => func(error.msg));
}

function createHeaders(token) {
    return {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": `Bearer ${token}`
    }
}

function clearInputFields() {
    var inputs = document.querySelectorAll('input');
    inputs.forEach(function(input) {
        input.value = '';
    });
}