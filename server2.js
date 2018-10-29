const express = require('express');
const app = express();
const basicAuth = require('basic-auth');
const pg = require('pg');

const { Pool, Client } = require('pg')

var config = {
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: 'password',
    port: '5432'
};


app.use(express.json());

// //Authorization of user using basicAuth module
// //Sending HTTP 403 in case of failure
// var auth = function(req, res, next){
//     var user = basicAuth(req);
//     if(!user || !user.name || !user.pass){
//         res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
//         res.sendStatus(403);
//         return;
//     }
//     if(user.name === "k" && user.pass === "r")    {
//         next();
       
//     }
    
// }

//Authorization of user using basicAuth module
//Sending HTTP 403 in case of failure
var auth = function(req, res, next){
    var user = basicAuth(req);
    if(!user || !user.name || !user.pass){
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(403);
        return;
    }
    const pool = new Pool(config);
    var result = null;

    const queryAuthenticate = "SELECT CASE WHEN EXISTS(SELECT 1 FROM ACCOUNT WHERE USERNAME = '" 
    + user.name +"' AND AUTH_ID = '" + user.pass + "') THEN 'TRUE' ELSE 'FALSE' END;";
    
    pool.query(queryAuthenticate, (err, resAuthenticate) => {
    result = resAuthenticate.rows[0].case;
    pool.end();
        if(result === 'TRUE'){
            next();
        } else {
            res.set('WWW-Authenticate', 'Basic realm = Authorization Required');
            res.sendStatus(403);
            return ;
        }
    });        
}



function validateMissingParams(req){
    const from = req.body.from;
    const to = req.body.to;
    const text = req.body.text;
    
    if(!from) 
        return ({"message" : "", "error" : "from is missing"});
    if(!to) 
        return ({"message" : "", "error" : "to is missing"});
    if(!text) 
        return ({"message" : "", "error" : "text is missing"});

    if(from.length < 6 || from.length > 16) 
        return ({"message" : "", "error" : "from is invalid"});
    if(to.length < 6 || to.length > 16) 
        return ({"message" : "", "error" : "to is invalid"});
    if(text.length < 1 || text.length > 120) 
        return ({"message" : "", "error" : "text is invalid"});

    else return null;
}


//API /inbound/sms
app.post('/inbound/sms',  auth, (req, res) => {
    const validateInboundResult = validateMissingParams(req);
    const from = req.body.from;
    const to = req.body.to;
    const text = req.body.text;
    
    
    //Validating the parameters
    if(validateInboundResult != null){
        return res.json(validateInboundResult);
    }else{
        return res.json({"message" : "All well", "error" : ""});
        
       
    }
});

app.get('/', (req, res) => res.send('Hello World! 12345'));

app.get('/inbound/sms/', function(req, res) {
    res.send('GET INBOUND SMS 12345');
});


//Starting the server on environment variable port or 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));