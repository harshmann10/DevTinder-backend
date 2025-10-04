const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const port = process.env.PORT;
const allowedOrigin = process.env.ALLOWED_ORIGIN;

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
const payementRouter = require("./routes/paymentRouter")
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

app.use("/", authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);
app.use("/payment", payementRouter)
app.use("/chat", chatRouter);

const server = http.createServer(app);
initializeSocket(server, allowedOrigin);

connectDB()
    .then(() => {
        console.log("Database connection established");
        server.listen(port, () => {
            console.log(`project starting on port ${port}....`);
        });
    })
    .catch((err) => {
        console.log("Database cannot be connected : " + err);
    });