// https://javascript.info/promise-chaining

// .then() returns a new Promise when you do "return",
// internally calling resolve().

// new Promise(function(resolve, reject) {

//     setTimeout(() => resolve(1), 1);
  
//   }).then(function(result) {
  
//     console.log(result);
//     return result * 2;
  
//   }).then(function(result) {
  
//     console.log(result);
//     return result * 2;
  
//   }).then(function(result) {
  
//     console.log(result);
//     return result * 2;
  
//   });

/*
    It will print 
    1
    2
    4
*/

/*
  It means that "then" is internally implemented roughly as follows:
  
  function then(f){
    return new Promise(function(resolve, reject) {
        resolve(f());
    })
  }
*/

// Another example:

fetch('http://www.fsf.org')
  // .then below runs when the remote server responds
  .then(function(response) {
    // response.text() returns a new promise that resolves with the full response text
    // when it loads
    return response.text();
  })
  .then(function(text) {
    // ...and here's the content of the remote file
    console.log(text);
  });