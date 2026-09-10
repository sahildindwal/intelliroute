import express from "express";
import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
import { Session, User } from "../models/models.js";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import { errorHandler } from "../utilities/errorHandler.utility.js";
import {
    clearCookie,
    getJWTToken,
    setCookie,
    setUserNameCookie,
} from "../utilities/auth.utility.js";
import mongoose from "mongoose";

const router = express.Router();

// Register new user
export const register = asyncHandler(async (req, res, next) => {
    try {
        const { name, email, password, phoneNumber, role, adminSecretKey } = req.body;

        // Validate admin secret key if registering as admin
        if (role === "admin") {
            if (!adminSecretKey) {
                return next(new errorHandler("Admin secret key is required for admin registration", 400));
            }
            if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
                return next(new errorHandler("Invalid admin secret key", 403));
            }
        }

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return next(new errorHandler("Email already registered", 400));

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
        });

        await user.save();
        res.status(201).json({
            success: true,
            message: `User registered successfully as ${role}`,
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Login user
export const login = asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return next(new errorHandler("Invalid email or password", 400));

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return next(new errorHandler("Invalid email or password", 400));

        // Get browser info from User-Agent header
        const agent = req.headers["user-agent"];
        const browser = agent.toString();

        // Get IP address (depends on proxy setup)
        const ipAddress =
            req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        // Use geoIP lookup here if desired for location, e.g., external API

        // Create session record
        const newSession = new Session({
            userId: user._id,
            browser,
            ipAddress,
            location: "Unknown", // Replace with resolved location if available
        });

        const savedSession = await newSession.save();
        const sessionId = savedSession._id;

        const tokenInfo = {
            id: user._id,
            sessionId,
            role: user.role,
            email: user.email,
            expiresIn: process.env.JWT_EXPIRES,
        };

        const token = getJWTToken(tokenInfo);
        setCookie(res, token);
        setUserNameCookie(res, user.name);

        res.status(201).json({
            success: true,
            message: token,
            user: {
                ...tokenInfo,
                name: user.name, // Include name in response
            },
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Get logged-in user's profile
export const getProfile = asyncHandler(async (req, res, next) => {
    try {
        let user = await User.findById(req.user.id).select("-password");
        if (!user) return next(new errorHandler("User not found", 404));
        const activeSessionCount = await Session.countDocuments({
            userId: req.user.id,
            isActive: true,
        });
        const inactiveSessionCount = await Session.countDocuments({
            userId: req.user.id,
            isActive: false,
        });

        user = user.toObject(); // convert Mongoose doc to plain object
        user["activeSessions"] = activeSessionCount;
        user["inactiveSessions"] = inactiveSessionCount;

        res.status(200).json({ success: true, message: user });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Update logged-in user's profile
export const updateProfile = asyncHandler(async (req, res, next) => {
    try {
        const {
            name,
            phoneNumber,
            oldPassword,
            newPassword,
            confirmNewPassword,
        } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return next(new errorHandler("User not found", 404));

        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (newPassword && confirmNewPassword) {
            if (!(await bcrypt.compare(oldPassword, user.password)))
                return next(new errorHandler("Incorrect Password", 400));
            if (newPassword != confirmNewPassword)
                return next(new errorHandler("Passwords don't match", 404));
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        
        // Update name cookie if name was changed
        if (name) {
            setUserNameCookie(res, user.name);
        }
        
        res.status(201).json({ success: true, message: "Profile updated" });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// List all users (admin only)
export const listAllUsers = asyncHandler(async (req, res, next) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ success: true, message: users });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Delete user (admin only)
export const deleteUser = asyncHandler(async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(new errorHandler("Invalid ObjectId", 400));
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return next(new errorHandler("User not found", 404));
        res.status(201).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Logout User By Session ID
export const logout = asyncHandler(async (req, res, next) => {
    try {
        const sessionId = req.user.sessionId;
        let session = await Session.findById(sessionId);

        session.isActive = false;
        clearCookie(res);
        await session.save();

        res.status(201).json({ success: true, message: "Logout successful" });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Logout User from all sessions
export const logoutAllSessions = asyncHandler(async (req, res, next) => {
    try {
        await Session.updateMany(
            { userId: req.user.id, isActive: true },
            { $set: { isActive: false } }
        );

        clearCookie(res);

        res.status(201).json({
            success: true,
            message: "Logged out from all devices",
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

export const checkUser = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};

export default router;
