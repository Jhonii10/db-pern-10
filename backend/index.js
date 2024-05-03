const express = require("express");
const logger = require("morgan");

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));


// entpoint
app.get('/ping', (req, res) => {
    res.send({
        "message":"pong"
    })
})

app.listen(4000, ()=>{
    console.log(`Server is running `);
})


