const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUp, validateLogin } = require("./utils/validation");
const app = express();
const bcrypt = require("bcrypt");
const port = 7777;

app.use(express.json()); // express.json middleware

app.post("/signup", async (req, res) => {
    try {
        // validation of data
        validateSignUp(req);

        const { FirstName, LastName, emailId, password } = req.body;
        // encrypt the password
        const passwordHash = await bcrypt.hash(password, 10)
        console.log(passwordHash);

        //creating a new instance of the User model
        const user = new User({
            FirstName, LastName, emailId, password: passwordHash
        });
        await user.save();
        res.send("User Signup succesfully");
    } catch (err) {
        res.status(400).send("Error Signup with User: " + err.message)
    }
})

app.post("/login", async (req, res) => {
    try {
        validateLogin(req)
        const { emailId, password } = req.body;
        const users = await User.findOne({ emailId: emailId });
        if (!users) {
            // throw new Error("EmailId in not present in DB") //we should never reveal internal detail to external entity as this a form of info leakage for user privacy and attacker
            throw new Error("Invalid Credentials")
        }

        const isPasswordValid = await bcrypt.compare(password, users.password)
        if (isPasswordValid) {
            res.send("User logged-in successfuly")
        } else {
            // throw new Error("password is not correct") //we should never reveal internal detail to external entity as this a form of info leakage for user privacy and attacker
            throw new Error("Invalid Credentials")
        }
    } catch (err) {
        res.status(401).send("Login failed: " + err.message)
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
        //API level validation
        const allowed_updates = [
            "photoUrl", "about", "gender", "age", "skills"
        ];
        const isupdateAllowed = Object.keys(data).every((k) => {
            return allowed_updates.includes(k);
        })
        if (!isupdateAllowed) {
            throw Error("update not allowed")
        }
        if (data?.skills?.length > 10) {
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