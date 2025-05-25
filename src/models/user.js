const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        FirstName: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 50,
            trim: true,
        },
        LastName: {
            type: String,
            maxlength: 50,
            trim: true,
        },
        emailId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("invalid email address");
                }
            },
        },
        password: {
            type: String,
            required: true,
            validate(value) {
                if (!validator.isStrongPassword(value)) {
                    throw new Error(
                        "password is weak " + value + " try a strong password"
                    );
                }
            },
        },
        age: {
            type: Number,
            min: 18,
            max: 100,
        },
        Gender: {
            type: String,
            enum: ["male", "female", "others"],
        },
        photoUrl: {
            type: String,
            default:
                "https://www.iconfinder.com/icons/2662226/account_blank_dummy_face_human_mannequin_profile_icon",
            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error("Invalid URL: " + value);
                }
            },
        },
        about: {
            type: String,
            default: "this a default about of the user",
            maxlength: 500,
        },
        skills: {
            type: [String],
        },
    },
    {
        timestamps: true,
    }
);

// Schema.methods for custom instance methods
userSchema.methods.getJWT = function () {
    const user = this;

    const token = jwt.sign({ _id: user._id }, "DevTinder@123", { expiresIn: "1h" });
    return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;

    const isPasswordValid = await bcrypt.compare(passwordInputByUser, user.password);
    return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema);