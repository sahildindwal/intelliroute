import mongoose from "mongoose";
import { Shuttle } from "../models/models.js";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import { errorHandler } from "../utilities/errorHandler.utility.js";

// Create a new Shuttle (Admin only)
export const addShuttle = asyncHandler(async (req, res, next) => {
    try {
        const {
            shuttleNumber,
            currentLocation,
            status,
            routeAssigned,
        } = req.body;

        // Check if shuttleNumber is unique
        const existingShuttle = await Shuttle.findOne({ shuttleNumber });
        if (existingShuttle)
            return next(new errorHandler("Shuttle number already exists", 400));

        const shuttle = new Shuttle({
            shuttleNumber,
            currentLocation,
            status,
            routeAssigned,
        });

        if (
            !shuttle.shuttleNumber ||
            !shuttle.currentLocation
        ) {
            return next(
                new errorHandler(
                    "Each shuttle must have shuttleNumber, and currentLocation",
                    400
                )
            );
        }
        
        await shuttle.save();
        res.status(201).json({ success: true, message: shuttle });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Add multiple shuttles in batch
export const addShuttles = asyncHandler(async (req, res, next) => {
    try {
        const shuttles = req.body.shuttles;

        if (!shuttles || !Array.isArray(shuttles) || shuttles.length === 0)
            return next(new errorHandler("No shuttles provided", 400));

        // Basic validation
        for (const shuttle of shuttles) {
            if (
                !shuttle.shuttleNumber ||
                !shuttle.currentLocation
            ) {
                return next(
                    new errorHandler(
                        "Each shuttle must have shuttleNumber, and currentLocation",
                        400
                    )
                );
            }
        }

        // Insert multiple shuttles at once, continue on errors (e.g., duplicates)
        const insertedShuttles = await Shuttle.insertMany(shuttles, {
            ordered: false,
        });

        res.status(201).json({
            success: true,
            message: `${insertedShuttles.length} shuttles added successfully`,
            data: insertedShuttles,
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Get all shuttles
export const getAllShuttles = asyncHandler(async (req, res, next) => {
    try {
        const shuttles = await Shuttle.find()
            .populate("currentLocation")
            .populate("routeAssigned");
        res.status(200).json({ success: true, message: shuttles });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Get shuttle by ID
export const getShuttle = asyncHandler(async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return next(new errorHandler("Invalid ObjectId", 400));

        const shuttle = await Shuttle.findById(req.params.id)
            .populate("currentLocation")
            .populate("routeAssigned");
        if (!shuttle) return next(new errorHandler("Shuttle not found", 404));
        res.status(200).json({ success: true, message: shuttle });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Update shuttle by ID (Admin only)
export const updateShuttle = asyncHandler(async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return next(new errorHandler("Invalid ObjectId", 400));

        const {
            shuttleNumber,
            currentLocation,
            status,
            routeAssigned,
        } = req.body;

        const shuttle = await Shuttle.findById(req.params.id);
        if (!shuttle) return next(new errorHandler("Shuttle not found", 404));

        if (shuttleNumber) shuttle.shuttleNumber = shuttleNumber;
        if (currentLocation) shuttle.currentLocation = currentLocation;
        if (status) shuttle.status = status;
        if (routeAssigned) shuttle.routeAssigned = routeAssigned;

        await shuttle.save();
        res.status(201).json({ success: true, message: shuttle });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Delete shuttle by ID (Admin only)
export const deleteShuttle = asyncHandler(async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return next(new errorHandler("Invalid ObjectId", 400));

        const shuttle = await Shuttle.findByIdAndDelete(req.params.id);
        if (!shuttle) return next(new errorHandler("Shuttle not found", 404));
        res.json({ success: true, message: "Shuttle deleted successfully" });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});
