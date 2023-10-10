async function exampleAsyncFunction() {
    console.log('Before await');
    await new Promise(function(resolve, reject) {
        setTimeout(() => resolve("done"), 500);
      }); // Pauses execution here until the promise resolves.
    console.log('After await');
  }
  
  console.log('Start');
  exampleAsyncFunction();
  console.log('End');