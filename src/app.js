const express = require("express");
const app = express();
const port = 7777;
const { adminAuth, userAuth } = require("./middlewares/auth.js")

app.get("/user?/:userid/blo+g/:blogid", (req, res) => {
    console.log(req.params);
    const { userid, blogid } = req.params;
    console.log(req.query);
    const name = req.query.name;
    res.send({ userid: `${userid}`, blogid: `${blogid}`, name: `${name}` });
});

app.use("/getuserdata", (req, res) => {
    try { //try catch is prefered
        throw new Error("error")
        res.send("user data sent")
    } catch (err) {
        res.status(500).send("something went wrong contact")
    }
});

// if try catch is not used then the error will be handled by the below route handler
app.use("/", (err, req, res, next) => {
    if (err) {
        res.status(500).send("something went wrong")
    }
})

app.listen(port, () => {
    console.log(`project starting on port ${port}....`);
});