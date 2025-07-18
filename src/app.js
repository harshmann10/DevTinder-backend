const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT;
const allowedOrigin = (process.env.ALLOWED_ORIGIN)

app.use(
    cors({
        origin: allowedOrigin,
        credentials: true,
    })
); // CORS middleware
app.use(express.json()); // express.json middleware
app.use(cookieParser()); // cookie-parser middleware

// router middlewares
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/userRouter");

app.use("/", authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);

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