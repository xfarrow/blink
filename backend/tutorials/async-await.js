// https://javascript.info/async-await

// A async function always returns a promise. Other values are wrapped in a resolved promise automatically.
// Async e Await sono solo "sintassi zuccherina" per rendere l'utilizzo delle Promise più semplice

async function f1() {
    return 1;
  }
  
  f1().then(console.log); // 1

// The keyword await makes JavaScript wait until that promise settles and returns its result.
// It can be used in async functions only
// Let’s emphasize: await literally suspends the function execution until the promise settles, 
// and then resumes it with the promise result.
async function f2() {

    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("done!"), 1000)
    });
  
    let result = await promise; // wait until the promise resolves (*)
  
    console.log(result); // "done!"
  }
  
  f2();

  // Domande
  // 
  // Why await only works in async function in javascript?
  // https://stackoverflow.com/questions/49640647/why-await-only-works-in-async-function-in-javascript
  //
  // Why using async-await
  // https://stackoverflow.com/questions/42624647/why-use-async-when-i-have-to-use-await
  //
  // Si faccia presente che non è possibile creare da zero una funzione asincrona (come
  // setInterval o fetch)
  // https://stackoverflow.com/questions/61857274/how-to-create-custom-asynchronous-function-in-javascript
