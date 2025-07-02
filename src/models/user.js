const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required."],
            minlength: [3, "First name must be at least {MINLENGTH} characters."],
            maxlength: [50, "First name cannot exceed {MAXLENGTH} characters."],
            trim: true,
            index: true, // index is used on this field for faster queries
        },
        lastName: {
            type: String,
            maxlength: [50, "Last name cannot exceed {MAXLENGTH} characters."],
            trim: true,
        },
        emailId: {
            type: String,
            required: true,
            unique: true, // if unique is true, it will create a unique index on this field
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
            min: [18, "Age must be at least {MIN}."],
            max: [100, "Age cannot exceed {MAX}."],
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female", "others"],
                message: "Please enter a valid gender",
            },
        },
        photoUrl: {
            type: String,
            default:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCpY5LtQ47cqncKMYWucFP41NtJvXU06-tnQ&s",
            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error("Invalid URL: " + value);
                }
            },
        },
        about: {
            type: String,
            default: "this a default about of the user",
            maxlength: [200, "About section cannot exceed {MAXLENGTH} characters."],
        },
        skills: {
            type: [String],
            validate: {
                validator: function (arr) {
                    // Remove empty strings and check for duplicates
                    const filtered = arr.filter((s) => s && s.trim() !== "");
                    const unique = new Set(filtered.map((s) => s.trim().toLowerCase()));
                    return filtered.length === arr.length && unique.size === arr.length;
                },
                message: "Skills must not contain empty or duplicate values.",
            },
        },
    },
    {
        timestamps: true,
    }
);

// Schema.methods for custom instance methods
userSchema.methods.getJWT = function () {
    const user = this;

    const token = jwt.sign({ _id: user._id }, "DevTinder@123", {
        expiresIn: "1h",
    });
    return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;

    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,
        user.password
    );
    return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);