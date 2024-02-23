// https://javascript.info/async-await

// A async function always returns a promise. Other values are wrapped in a resolved promise automatically.
// Async e Await sono solo "sintassi zuccherina" per rendere l'utilizzo delle Promise più semplice

async function f1 () {
  return 1;
}

f1().then(console.log); // 1

// The keyword await makes JavaScript wait until that promise settles and returns its result.
// It can be used in async functions only
// Let’s emphasize: await literally suspends the function execution until the promise settles,
// and then resumes it with the promise result.
async function f2 () {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve('done!'), 1000);
  });

  const result = await promise; // wait until the promise resolves (*)

  console.log(result); // "done!"
}

f2();

// Tutto il codice nella stessa funzione (o nello stesso blocco di codice)
// dopo "await" è da considerarsi nel "then()" di una promessa. Pertanto dopo
// await (ma prima del completamento della Promise),
// il flusso di esecuzione va fuori a quel blocco di codice. Ad esempio considera
// il seguente esempio:
async function exampleAsyncFunction () {
  console.log('Before await');
  await new Promise(function (resolve, reject) {
    setTimeout(() => resolve('done'), 500);
  }); // Pauses execution here until the promise resolves.
  console.log('After await');
}

console.log('Start');
exampleAsyncFunction();
console.log('End');

// Il risultato sarà:
// Start, Before Await, End, After await
// Viene prima "End" e poi "After Await", perché
// dopo await, il flusso di esecuzione ritorna al
// chiamante

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
//
// Altra domanda interessante
// https://stackoverflow.com/questions/42624647/why-use-async-when-i-have-to-use-await
