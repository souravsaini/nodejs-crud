const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "User must have email"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "admin", "staff"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "User must provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "User must confirm password"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Password and confirm password do not match.",
    },
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  //only run if password is modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12); //12 is salt
  this.passwordConfirm = undefined;
  next();
});

//hide inactive users from the find queries
userSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  console.log(this);
  next();
});

userSchema.methods.checkPassword = async function (
  enteredPassword,
  storedPassword
) {
  return await bcrypt.compare(enteredPassword, storedPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
