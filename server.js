
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const xssClean = require("xss-clean");
const cookieParser = require("cookie-parser");
const { userRouter } = require("./routers/userRouter");
const { seedRouter } = require("./routers/seedRouter");
const { authRouter } = require("./routers/authRouter");
const { errorResponse } = require("./controllers/responseController");
const { subscriptionRouter } = require("./routers/subscriptionRouter");
const { taxRangeSheetRouter } = require("./routers/taxRangeSheetRoutes");
const clientDetialsRouter = require("./routers/clientDetialsRouter");
const textPlanGeneratorRouter = require("./routers/textPlanGeneratorRouter");
const { stripeWebhookSecret, stripeSecretKey } = require("./secret");
const Stripe = require("stripe");

const stripe = Stripe(stripeSecretKey);

require("./config/db");

const app = express();

// Middleware setup
app.use(cookieParser());
app.use(cors());
app.use(xssClean());
app.use(morgan("dev"));

app.use("/api/webhook", express.raw({ type: "application/json" }));

app.use(bodyParser.json());

app.use("/api/seed", seedRouter);
app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", subscriptionRouter);
app.use("/api", taxRangeSheetRouter);
app.use("/api", clientDetialsRouter);
app.use("/api", textPlanGeneratorRouter);

// Basic route for testing
app.get("/", (req, res) => {
  return res
    .status(201)
    .json({ success: true, message: "Welcome to the server" });
});

// Client error handling for undefined routes
app.use((req, res, next) => {
  next(createError(404, "Route not found"));
});

// Server error handling
app.use((err, req, res, next) => {
  return errorResponse(res, { statusCode: err.status, message: err.message });
});

module.exports = app;
