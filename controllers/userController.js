const User = require("../models/userModel");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
};

exports.getUser = async (req, res) => {
  const user = await User.find(req.params.id);
  if (!user) {
    return res.status(404).json({
      status: "failed",
      message: "User not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};

exports.deleteMe = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
};

exports.updateUser = async (req, res) => {
  if (req.body.password || req.body.passwordConfirm) {
    return res.status(400).json({
      status: "failed",
      message: "This route does not supports password reset.",
    });
  }

  //filter req.body
  let filteredBody = {};

  //staff can only update email and user
  if (req.user.role === "staff")
    filteredBody = filterObj(req.body, "name", "email");
  //admin can activate or change user's role.
  else if (req.user.role === "admin")
    filteredBody = filterObj(req.body, "name", "email", "role", "isActive");

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return res.status(404).json({
      status: "failed",
      message: "User not found.",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
};

exports.updateMe = async (req, res) => {
  if (req.body.password || req.body.passwordConfirm) {
    return res.status(400).json({
      status: "failed",
      message: "This route does not supports password reset.",
    });
  }

  //filter req.body to only update name and email
  const filteredBody = filterObj(req.body, "name", "email");

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
};
