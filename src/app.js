const express = require('express');
const app = express();
const port = 7777;

app.get(/.*fly$/, (req, res) => {
    res.send({ firstname: 'harsh', lastname: 'mann' })
})

app.get("/user?/:userid/blo+g/:blogid", (req, res) => {
    console.log(req.params)
    const {userid, blogid} = req.params;
    console.log(req.query)
    const name = req.query.name;
    res.send({ userid: `${userid}`, blogid: `${blogid}`, name: `${name}`})
})

//this will match all the http method API call to /test
app.use("/test", (req, res) => {
    res.send("hello from server!")
})

app.listen(port, () => {
    console.log(`project starting on port ${port}....`);
});