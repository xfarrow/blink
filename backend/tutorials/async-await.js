// https://javascript.info/async-await

// A async function always returns a promise. Other values are wrapped in a resolved promise automatically.

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