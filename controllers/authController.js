const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userModel");

const getJWTToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role || "user",
    });

    //generate json web token
    const token = getJWTToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Please provide email and password.",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.checkPassword(password, user.password))) {
      return res.status(401).json({
        status: "failed",
        message: "Authentication failed",
      });
    }

    const token = getJWTToken(user._id);

    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: err,
    });
  }
};

exports.isAuth = async (req, res, next) => {
  try {
    //Get token and check if it is there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "failed",
        message: "User unauthenticated.",
      });
    }

    //validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //check if user still exists
    const refreshedUser = await User.findById(decoded.id);
    if (!refreshedUser) {
      return res.status(404).json({
        status: "failed",
        message: "User does not exists",
      });
    }

    //user authentication completed
    req.user = refreshedUser;
    next();
  } catch (err) {
    res.status(500).json({
      status: "failed",
      message: "something went wrong.",
    });
  }
};

exports.isAllowed = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "failed",
        message: "Unauthorized",
      });
    }
    next();
  };
};
