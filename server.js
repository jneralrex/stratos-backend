const express = require("express");
const { config } = require("./config/config");
const connectDataBase = require("./config/dbConnect");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet"); 
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const transactionRoutes = require("./routes/transaction.routes");
const affiliateRoutes = require("./routes/affiliate.routes");




const app = express();
const port = config.port || 4000;

//  Connect to Database
connectDataBase();

//  Middleware
app.use(helmet()); // Adds security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Supports form submissions


app.use(cors({ 
    origin: "*",  // Change this to your frontend URL
    credentials: true 
}));
app.use(cookieParser());

//  Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/affiliate", affiliateRoutes);




//  Global Error Handler
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle Mongoose Validation Errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(", ");
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
