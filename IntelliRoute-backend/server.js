import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./db_connection.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { userRouter } from "./routes/user.route.js";
import { locationRouter } from "./routes/location.route.js";
import { shuttleRouter } from "./routes/shuttle.route.js";
import { rideRequestRouter } from "./routes/rideRequest.route.js";
dotenv.config();
import cors from "cors";

// Connect to mongo db database via mongoose
connectDB();

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://intelliroute-frontend.onrender.com",
    "https://intelliroute.mayankrajtools.me",
    process.env.FRONTEND_URL, // Add from env variable
].filter(Boolean); // Remove undefined values

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("CORS blocked origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // This enables the `Access-Control-Allow-Credentials` header
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // You can restrict these if needed
    allowedHeaders: ["Content-Type", "Authorization"], // Specify required headers
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: `API is running...`,
    });
});

// Routes
app.use("/api/users", userRouter); // User routes
app.use("/api/locations", locationRouter); // Location routes
app.use("/api/shuttles", shuttleRouter); // Shuttles routes
app.use("/api/rides", rideRequestRouter); // Ride request routes
app.use(errorMiddleware);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
});
