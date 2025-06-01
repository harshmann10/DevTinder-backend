const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://harsh:KeWPOzH7FWMDUvl4@namastenode.4fmgnds.mongodb.net/DevTinder"
    );
};

module.exports = connectDB;