const express = require('express');
const app = express();
const port = 7777;

app.get("/user",(req,res) => {
    res.send({firstname: 'harsh' , lastname : 'mann'})
})

app.post("/user", (req,res) => {
    //saving data to db
    res.send("data is successfully saved to DB")
})

app.patch("/user", (req,res) =>{
    res.send("data is updated to DB")
})

app.delete("/user", (req,res) =>{
    res.send("data is deleted from DB")
})

//this will match all the http method API call to /test
app.use("/test", (req, res) => {
    res.send("hello from server!")
})

// app.use("/", (req, res) => {
//     res.send("hello from harsh!")
// })
    
app.listen(port , () =>{
    console.log(`project starting on port ${port}....`);
});