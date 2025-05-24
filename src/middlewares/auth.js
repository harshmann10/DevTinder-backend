const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    // read the token from req cookie
    // validate the token
    //find the user in the database
    try {
        const cookie = req.cookies;
        const { token } = cookie;
        if (!token) {
            throw new Error("invalid token");
        }
        const decodedMsg = jwt.verify(token, "DevTinder@123");
        const { _id: id } = decodedMsg;
        const user = await User.findById(id)
        if (!user) {
            throw new Error("invalid user login again");
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(400).send("error: " + err.message);
    }
};

module.exports = { userAuth };