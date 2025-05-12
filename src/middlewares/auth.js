const adminAuth = (req, res, next) => {
    console.log("user auth is getting checked");
    const token = "xyz";
    if (!(token === "xyz")) {
        res.status(401).send("token is not correct")
    } else {
        next();
    }
};

const userAuth = (req, res, next) => {
    console.log("user auth is getting checked");
    const token = "xyz";
    if (!(token === "xyz")) {
        res.status(401).send("token is not correct")
    } else {
        next();
    }
};

module.exports = { adminAuth , userAuth };