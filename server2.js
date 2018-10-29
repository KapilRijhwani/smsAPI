const express = require('express');
const app = express();


app.use(express.json());

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
app.post('/inbound/sms',  (req, res) => {
    const validateInboundResult = validateMissingParams(req);
    const from = req.body.from;
    const to = req.body.to;
    const text = req.body.text;
    
    
    //Validating the parameters
    if(validateInboundResult != null){
        return res.json(validateInboundResult);
    }else{
        return ({"message" : "All well", "error" : ""});
        
       
    }
});

app.get('/', (req, res) => res.send('Hello World! 12345'));

app.get('/inbound/sms/', function(req, res) {
    res.send('GET INBOUND SMS 12345');
});


//Starting the server on environment variable port or 3000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));