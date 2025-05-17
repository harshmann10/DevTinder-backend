const express = require("express");
const connectDB = require("./config/database")
const User = require("./models/user")
const app = express();
const port = 7777;

app.use(express.json()); // express.json middleware

app.post("/signup", async (req, res) =>{
    //creating a new instance of the User model
    const user = new User(req.body);

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