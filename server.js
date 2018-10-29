/*
Suggestions
1. modular code
2. good self explanatory naming
3. use ====
4. use let instead of var
*/

//Loading the modules 
const Joi = require('joi');
const express = require('express');
const app = express();
const basicAuth = require('basic-auth');
const pg = require('pg');
const redis = require('redis');
const client = redis.createClient();

const { Pool, Client } = require('pg')

//Configuration for PostgreSql Connection
var config = {
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: 'password',
    port: '5432'
};

app.use(express.json());

//Connecting to client of Redis cache
// client.on('connect', function() {
//     console.log('Redis client connected');
// });

// client.on('error', function(err) {
//     console.log('Something went wrong ' + err);
// });

//Validaing the parameters passed for length and not null conditions.
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

//API /inbound/sms
app.post('/inbound/sms', auth, (req, res) => {
    const validateInboundResult = validateMissingParams(req);
    const from = req.body.from;
    const to = req.body.to;
    const text = req.body.text;
    
    
    //Validating the parameters
    if(validateInboundResult != null){
        return res.json(validateInboundResult);
    }else{

        var user = basicAuth(req);
        //Getting the id of username used while authentication
        const queryGetId = "SELECT ID FROM ACCOUNT WHERE USERNAME = '" + user.name +"'";
        var pool = new Pool(config);
        var poolInside = new Pool(config);
        var id = null;
        
        pool.query(queryGetId, (err, resIdExists) => {
            var id = resIdExists.rows[0].id;
            if(id != null)
            {            
                //Checking if to phone number is associated with authorized user.
                const queryToExists =   { 
                      text : "SELECT CASE WHEN EXISTS(SELECT 1 FROM PHONE_NUMBER WHERE NUMBER = '"
                     + to +"' AND ACCOUNT_ID = '" + parseInt(id) + "') THEN 'TRUE' ELSE 'FALSE' END;"
                }

                poolInside = new Pool(config);
                var result = null;
                
                poolInside.query(queryToExists, (err, resToExists) => {
                    if(resToExists == null)
                        return res.json({"message" : "", "error": "query to exists"});
                        
                    result = resToExists.rows[0].case;
                    //If to- phone number is not associated with authorized user return result as FALSE
                    if(result === 'FALSE') 
                        return res.json({"message" : "", "error": "to parameter not found"});
                    //If to- phone number is associated with authorized user return result as TRUE
                    else{ 
                        //Storing to and from pair in cache if text = STOP
                        // if(text === "STOP"){
                        //     var time = 4 * 60 * 60;
                        //     client.set(from, to, redis.print, 'EX', time);
                        //     client.get(from, function(error, result) {
                            
                        //     if(error) {
                        //         console.log(error);
                        //         throw error;
                        //     }
                            
                        //     console.log('got result -> ' + result);
                        //     console.log('expire after -> ' + time);
                        //     });
                        // }else{
                        //     console.log('No stop text found!!!!')
                        // }
                        return res.json({"message" : "inbound sms ok", "error" : ""});    
                    }
                    
                    poolInside.end();
                });    
            }else{
                return;
            }
        }); 
        pool.end();
    }
});

//API /outbound/sms
app.post('/outbound/sms', auth, (req, res) => {
    const validateOutboundResult = validateMissingParams(req);
    const from = req.body.from;
    const to = req.body.to;
    const text = req.body.text;
    
    
    //Validating the parameters
    if(validateOutboundResult != null){
        return res.json(validateOutboundResult);
    }else{
        var user = basicAuth(req);
        //Getting the id of username used while authentication
        const queryGetId = "SELECT ID FROM ACCOUNT WHERE USERNAME = '" + user.name +"'";
        var pool = new Pool(config);
        var poolInside = new Pool(config);
        var id = null;

        pool.query(queryGetId, (err, resIdExists) => {
            var id = resIdExists.rows[0].id;
            if(id != null)
            {            
                //Checking if from phone number is associated with authorized user.
                const queryFromExists =   { 
                      text : "SELECT CASE WHEN EXISTS(SELECT 1 FROM PHONE_NUMBER WHERE NUMBER = '"
                     + from +"' AND ACCOUNT_ID = '" + parseInt(id) + "') THEN 'TRUE' ELSE 'FALSE' END;"
                }

                poolInside = new Pool(config);
                var result = null;
                
                poolInside.query(queryFromExists, (err, resFromExists) => {
                    if(resFromExists == null)
                        return res.json({"message" : "", "error": "query to exists"});
                        
                    result = resFromExists.rows[0].case;
                    
                    //If from- phone number is not associated with authorized user return result as FALSE
                    if(result === 'FALSE') 
                        return res.json({"message" : "", "error": "from parameter not found"});
                    //If from- phone number is associated with authorized user return result as TRUE
                    else{
                        // client.exists(from, function(err, reply){
                        //     if(reply === 1){
                        //         client.incr(re)
                        //     }
                        // });
                        return res.json({"message" : "outbound sms ok", "error" : ""});    
                    }

                    
                    poolInside.end();
                });    
            }else{
                return;
            }
        }); 
        pool.end();
    }

});

//If API is called with any other method than PUT return HTTP 405
app.get('/inbound/sms/', function(req, res) {
    res.sendStatus(405);
});

app.get('/outbound/sms/', function(req, res) {
    res.sendStatus(405);
});

app.delete('/inbound/sms/:id', function(req, res) {
    res.sendStatus(405);
});

app.delete('/outbound/sms/:id', function(req, res) {
    res.sendStatus(405);
});

app.put('/inbound/sms/:id', function(req, res) {
    res.sendStatus(405);
});

app.put('/outbound/sms/:id', function(req, res) {
    res.sendStatus(405);
});

//Starting the server on environment variable port or 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));