const express = require("express");
const connectDB = require("./config/database")
const User = require("./models/user")
const app = express();
const port = 7777;

app.post("/signup", async (req, res) =>{
    const userObj = {
        FirstName : "ranbir",
        LastName : "kumar",
        emailId : "ranbir@abc.com",
        password: "ranbir@123",
        // _id: "10000f19ce8de465c6c12a66"
    }
    //creating a new instance of the User model
    const user = new User(userObj);

    try {
        await user.save();
        res.send("User added succesfully");
    } catch (err) {
        res.status(400).send("Error saving the User: " + err)
    }
})

connectDB().then(() => {
    console.log("Database connection established");
    app.listen(port, () => {
        console.log(`project starting on port ${port}....`);
    });
}).catch((err) => {
    console.log("Database cannot be connected : " + err);
})