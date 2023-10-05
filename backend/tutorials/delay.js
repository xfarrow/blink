/*
    The built-in function setTimeout uses callbacks. Create a promise-based alternative.
    The function delay(ms) should return a promise. That promise should resolve after ms milliseconds, so that we can add .then to it, like this:
*/

function delay(ms){
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

delay(1000).then(() => console.log("Hello world!"));
