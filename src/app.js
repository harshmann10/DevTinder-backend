const express = require("express");
const app = express();
const port = 7777;

app.get(/.*fly$/, (req, res) => {
    res.send({ firstname: "harsh", lastname: "mann" });
});

app.get("/user?/:userid/blo+g/:blogid", (req, res) => {
    console.log(req.params);
    const {userid, blogid} = req.params;
    console.log(req.query);
    const name = req.query.name;
    res.send({ userid: `${userid}`, blogid: `${blogid}`, name: `${name}` });
});

app.use("/user",
    [(req, res, next) => {
        console.log("1st response");
        next();
        // res.send("hello from server!");
    },
    (req, res, next) => {
        console.log("2st response");
        // res.send("hello from server 2!");
        next();
    }],
    (req, res, next) => {
        console.log("3st response");
        // res.send("hello from server 3!");
        next();
    },
    (req, res, next) => {
        console.log("4th response");
        res.send("hello from server 4!");
    }
);

app.listen(port, () => {
    console.log(`project starting on port ${port}....`);
});