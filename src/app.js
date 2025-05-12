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

// handle auth middleware for get,post,... requests
app.use("/admin", adminAuth);

app.get("/user/login" ,(req, res) => {
    res.send("you are now logged in");
})

app.get("/user", userAuth, (req, res) => {
    res.send("user data sent");
})

app.get("/admin/data", (req, res, next) => {
    res.send("all data sent");
});

app.get("/admin/delete", (req, res, next) => {
    res.send("all data delete");
});

app.listen(port, () => {
    console.log(`project starting on port ${port}....`);
});