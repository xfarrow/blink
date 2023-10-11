// https://javascript.info/callbacks

 function execute_action(param, callback){

    if(param == "something"){
        console.log("Executing action: " + param);
        callback(null, Date.now());
    }
    else{
        // We can call callback with one argument even if
        // the signature states two parameters
        callback(new Error("Invalid parameter"))
    }
}

function entryPoint(){
    /* ===== Begin Simple callback ===== */

    execute_action("something", function (error, time_of_completion){
        if(error){
            console.log("Something happened");
        }
        else{
            console.log("Time of completion: " + new Date(time_of_completion).toDateString());
        }
    });
    console.log("I started here!");
    /*
    Ciò è utile se ad esempio execute_action fa operazioni lente (ad esempio 
    scrittura su database, connessioni HTTP ecc..) ma abbiamo bisogno
    del suo valore di ritorno per continuare una determinata operazione
    (in questo caso la data di completamento dell'esecuzione), 
    senza però bloccare le altre operazioni che non hanno bisogno di tale
    valore, in questo caso console.log("I started here!");

    Questo però è solo un esempio in quanto le istruzioni verranno
    eseguite in maniera sincrona, ma che ci permette di
    comprendere le basi di questo meccanismo.
    */
    
    /* ===== End Simple Callback ===== */
}

entryPoint();