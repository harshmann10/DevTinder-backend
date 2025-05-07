const express = require('express');

const app = express();

app.use("/help", (req, res) => {
    res.send("hello from server!")
})

app.use("/", (req, res) => {
    res.send("hello from harsh!")
})
    
app.listen(7777 , () =>{
    console.log("project starting on port 7777....");
});