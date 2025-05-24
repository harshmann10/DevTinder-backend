const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUp, validateLogin } = require("./utils/validation");
const app = express();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");
const port = 7777;

app.use(express.json()); // express.json middleware
app.use(cookieParser()); // cookie-parser middleware

app.post("/signup", async (req, res) => {
    try {
        // validation of data
        validateSignUp(req);

        const { FirstName, LastName, emailId, password } = req.body;
        // encrypt the password
        const passwordHash = await bcrypt.hash(password, 10);
        console.log(passwordHash);

        //creating a new instance of the User model
        const user = new User({
            FirstName,
            LastName,
            emailId,
            password: passwordHash,
        });
        await user.save();
        res.send("User Signup succesfully");
    } catch (err) {
        res.status(400).send("Error Signup with User: " + err.message);
    }
});

app.post("/login", async (req, res) => {
    try {
        validateLogin(req);
        const { emailId, password } = req.body;
        const users = await User.findOne({ emailId: emailId });
        if (!users) {
            throw new Error("Invalid Credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, users.password);
        if (isPasswordValid) {
            const token = jwt.sign({ _id: users._id }, "DevTinder@123", { expiresIn: "1h" }); //create a JWT token
            // set the token in cookies and send the cookie to the browser
            res.cookie("token", token, { maxAge: 7 * 24 * 60 * 60 * 1000 });
            // res.cookie("token", token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            res.send("User logged-in successfuly");
        } else {
            throw new Error("Invalid Credentials");
        }
    } catch (err) {
        res.status(401).send("Login failed: " + err.message);
    }
});

//get profile data
app.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(401).send("getting profile data failed: " + err.message);
    }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
    const user = req.user;
    res.send(`request sent by ${user.FirstName}`);
})

connectDB()
    .then(() => {
        console.log("Database connection established");
        app.listen(port, () => {
            console.log(`project starting on port ${port}....`);
        });
    })
    .catch((err) => {
        console.log("Database cannot be connected : " + err);
    });