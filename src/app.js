const express = require("express");
const connectDB = require("./config/database")
const User = require("./models/user")
const app = express();
const port = 7777;

app.use(express.json()); // express.json middleware

app.post("/signup", async (req, res) => {
    //creating a new instance of the User model
    const user = new User(req.body);
    try {
        await user.save();
        res.send("User added succesfully");
    } catch (err) {
        res.status(400).send("Error saving the User: " + err)
    }
})

//get user by email
app.get("/user", async (req, res) => {
    const userEmail = req.body.emailId;
    try {
        const users = await User.findOne({ emailId: userEmail })
        // const users = await User.find({ emailId: userEmail })
        if (users.length === 0) {
            res.status(404).send("User not found");
        } else {
            res.send(users)
        }
    } catch (err) {
        res.status(400).send("something went wrong error - " + err);
    }
})

//get user by id
app.get("/userid", async (req, res) => {
    const id = req.body.id;
    try {
        const users = await User.findById(id);
        if (users.length === 0) {
            res.status(404).send("User not found");
        } else {
            res.send(users)
        }
    } catch (err) {
        res.status(400).send("something went wrong " + err)
    }
})

//Feed API - GET /feed- get all the users from the database
app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users)
    } catch (err) {
        res.status(400).send("something went wrong error - " + err);
    }
})

//delete the user by id
app.delete("/userid", async (req, res) => {
    const id = req.body.id;
    try {
        // await User.findOneAndDelete({_id : id})
        await User.findByIdAndDelete(id)
        res.send("user deleted succesfully")
    } catch (err) {
        res.status(400).send("something went wrong error - " + err);
    }
})

//update the user data by id
app.patch("/userid/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;
    try {
        const allowed_updates = [
            "photoUrl", "about", "gender", "age", "skills"
        ];
        const isupdateAllowed = Object.keys(data).every((k) => {
            return allowed_updates.includes(k);
        })
        if (!isupdateAllowed) {
            throw Error("update not allowed")
        }
        if (data?.skills.length > 10) {
            throw Error("skills not allowed more than 10")
        }
        // await User.findByIdAndUpdate(id, data);
        const user = await User.findOneAndUpdate({ _id: userId }, data, { returnDocument: "before", runValidators: true });
        console.log(user);
        res.send("user updated succesfully")
    } catch (err) {
        res.status(400).send("something went wrong " + err);
    }
})

//update the user data by emailId
app.patch("/user", async (req, res) => {
    const email = req.body.email;
    const data = req.body;
    try {
        const user = await User.findOneAndUpdate({ emailId: email }, data, { returnDocument: "before", runValidators: true });
        console.log(user);
        res.send("user updated succesfully")
    } catch (err) {
        res.status(400).send("something went wrong error - " + err);
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