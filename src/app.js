const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const port = 7777;
// const User = require("./models/user");
// const { validateSignUp, validateLogin } = require("./utils/validation");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { userAuth } = require("./middlewares/auth");

app.use(express.json()); // express.json middleware
app.use(cookieParser()); // cookie-parser middleware

// router middlewares
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

app.use("/", authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);

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