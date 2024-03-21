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

function callbackErrors(errors, func) {
    errors.forEach(error => func(error.msg));
}

function createHeaders(token) {
    return {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": `Bearer ${token}`
    }
}