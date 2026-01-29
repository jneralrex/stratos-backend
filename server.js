require("dotenv").config();
const express = require("express");
const { config } = require("./config/config");
const connectDataBase = require("./config/dbConnect");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet"); 
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const transactionRoutes = require("./routes/transaction.routes");
const affiliateRoutes = require("./routes/affiliate.routes");

const app = express();
const port = config.port || 4000;

//  Connect DB
connectDataBase();

//  Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(helmet()); 
app.use(morgan("dev")); 


app.use(
  cors({
    origin: [
      "http://localhost:3000",   
      "https://stratoslab.vercel.app", 
      "https://www.trustedtek.org"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
  })
);

//  Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/affiliate", affiliateRoutes);

//  Health Check Route (helpful for Render/Vercel pings)
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy 🚀" });
});

//  Global Error Handler
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Handle MongoDB Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate value entered.";
  }

  // Handle Database Errors
  if (err.name === "MongoError") {
    statusCode = 500;
    message = "Database error occurred.";
  }

  // Handle Connection Timeout
  if (err.name === "ConnectionTimeout") {
    statusCode = 408;
    message = "Connection timeout.";
  }

  // Log errors in development
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
});

//  Start Server
app.listen(port, () => {
  console.log(` Server is running on http://localhost:${port}`);
});
