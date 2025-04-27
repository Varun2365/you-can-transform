const express = require('express')
const os = require('os')
const app = express();
app.listen(80, ()=>{
    console.log("App Listening on port 8000")
})

app.get('/', (req, res)=>{
    res.send("VPS STARTED " + os.cpus()[0]['model'] + " " +os.cpus().length);
})