const express = require("express");
const userRouter = require("./routes/userRoutes");

const app = express();

//middlewares
app.use(express.json());

//routes
app.use("/api/v1/users", userRouter);

//catch all route
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "failed",
    message: `Can't find ${req.originalUrl} on this server.`,
  });

  next();
});

module.exports = app;
