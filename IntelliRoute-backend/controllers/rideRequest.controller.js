import mongoose from "mongoose";
import { RideRequest, Shuttle } from "../models/models.js";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import { errorHandler } from "../utilities/errorHandler.utility.js";
import {
    buildCostMatrix,
    hungarianAlgorithm,
    padMatrixToSquare,
} from "../hungarian_algo/matching_algo.js";

// Create a new ride request
export const requestRide = asyncHandler(async (req, res, next) => {
    try {
        const { sourceLocation, destinationLocation } = req.body;

        if (!sourceLocation || !destinationLocation)
            return next(
                new errorHandler("Source and destination are required", 400)
            );

        if (sourceLocation === destinationLocation)
            return next(
                new errorHandler("Source and destination must be different", 400)
            );

        const newRide = new RideRequest({
            userId: req.user.id,
            sourceLocation,
            destinationLocation,
        });

        const savedRide = await newRide.save();

        res.status(201).json({
            success: true,
            message: "Ride request created successfully",
            ride: savedRide,
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Get all ride requests (Admin only)
export const allRideRequests = asyncHandler(async (req, res, next) => {
    try {
        const rides = await RideRequest.find()
            .populate("userId", "name email")
            .populate("sourceLocation destinationLocation", "name code")
            .populate("assignedShuttleId", "shuttleNumber");
        res.status(200).json({ success: true, message: rides });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Get all rides of logged-in user
export const rideRequestHistory = asyncHandler(async (req, res, next) => {
    try {
        const rides = await RideRequest.find({ userId: req.user.id })
            .populate("sourceLocation destinationLocation", "name code")
            .populate("assignedShuttleId", "shuttleNumber");
        res.status(200).json({ success: true, message: rides });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Get ride request by ID
export const rideRequestByID = asyncHandler(async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return next(new errorHandler("Invalid ObjectId", 400));
        const ride = await RideRequest.find({
            userId: req.user.id,
            _id: req.params.id,
        })
            .populate("userId", "name email")
            .populate("sourceLocation destinationLocation", "name code");

        if (!ride) return next(new errorHandler("Ride not found", 404));

        res.status(200).json({ success: true, message: ride });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Cancel a ride request
export const cancelRide = asyncHandler(async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return next(new errorHandler("Invalid ObjectId", 400));
        const ride = await RideRequest.findById(req.params.id);
        if (!ride) return next(new errorHandler("Ride not found", 404));

        if (
            (ride.userId.toString() !== req.user.id &&
                req.user.role !== "admin") ||
            ride.status !== "pending"
        )
            return next(
                new errorHandler("Not authorized to cancel this ride", 403)
            );

        ride.status = "cancelled";
        ride.cancellationTime = Date.now();
        await ride.save();

        res.status(200).json({
            success: true,
            message: "Ride cancelled successfully",
            ride,
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Update ride status
export const updateRideStatus = asyncHandler(async (req, res, next) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ["completed"];

        if (!allowedStatuses.includes(status))
            return next(new errorHandler("Invalid status value", 400));

        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return next(new errorHandler("Invalid ObjectId", 400));
        const ride = await RideRequest.findById(req.params.id);
        if (!ride) return next(new errorHandler("Ride not found", 404));

        if (status === "completed") {
            if (ride.status === "cancelled")
                return new errorHandler(
                    "Ride request must not be in cancelled state",
                    400
                );
            ride.completionTime = Date.now();
            const shuttleId = ride.assignedShuttleId;
            if (shuttleId) {
                const assignedShuttle = await Shuttle.findOne({
                    _id: shuttleId,
                });
                assignedShuttle.status = "active";
                assignedShuttle.routeAssigned = undefined;
                await assignedShuttle.save();
                ride.assignedShuttleId = undefined;
            }
        }
        ride.status = status;

        const updatedRide = await ride.save();

        res.json({
            success: true,
            message: "Ride status updated",
            ride: updatedRide,
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Ride matching function using Hungarian algorithm
export const matchRidesWithShuttles = asyncHandler(async (req, res, next) => {
    try {
        const rides = await RideRequest.find({ status: "pending" }).populate(
            "sourceLocation destinationLocation"
        );
        const shuttles = await Shuttle.find({ status: "active" }).populate(
            "currentLocation"
        );

        if (rides.length === 0 || shuttles.length === 0) {
            return next(
                new errorHandler(
                    "No rides or shuttles available for matching",
                    400
                )
            );
        }

        // Build cost matrix using Dijkstra's algorithm
        let costMatrix = await buildCostMatrix(rides, shuttles);
        if (!costMatrix.length || !costMatrix[0].length) {
            return next(
                new errorHandler("Invalid cost matrix - check locations", 400)
            );
        }
        
        // Store original cost matrix for response
        const originalCostMatrix = costMatrix.map(row => [...row]);
        
        // Make sure matrix is square
        costMatrix = padMatrixToSquare(costMatrix);
        // Compute optimal assignments using Hungarian algorithm
        const assignments = hungarianAlgorithm(costMatrix);

        const matches = [];
        const optimalAssignment = [];

        for (const [rideIdx, shuttleIdx] of assignments) {
            // Skip dummy padded values
            if (rideIdx >= rides.length || shuttleIdx >= shuttles.length)
                continue;

            const ride = rides[rideIdx];
            const shuttle = shuttles[shuttleIdx];

            // Update ride request
            ride.status = "matched";
            ride.assignedTime = Date.now();
            ride.assignedShuttleId = shuttle._id;
            await ride.save();

            // Update shuttle status
            shuttle.status = "assigned";
            shuttle.routeAssigned = [
                ride.sourceLocation._id,
                ride.destinationLocation._id,
            ];
            await shuttle.save();

            matches.push({
                rideId: ride._id,
                shuttleId: shuttle._id,
                cost: originalCostMatrix[rideIdx][shuttleIdx],
                shuttleNo: shuttle.shuttleNumber,
            });
            
            optimalAssignment.push({
                rideIndex: rideIdx,
                shuttleIndex: shuttleIdx,
                cost: originalCostMatrix[rideIdx][shuttleIdx]
            });
        }
        
        // Prepare cost matrix with labels for frontend
        const costMatrixWithLabels = {
            matrix: originalCostMatrix,
            rideLabels: rides.map((r, idx) => ({
                index: idx,
                rideId: r._id,
                source: r.sourceLocation.name,
                destination: r.destinationLocation.name
            })),
            shuttleLabels: shuttles.map((s, idx) => ({
                index: idx,
                shuttleId: s._id,
                shuttleNumber: s.shuttleNumber,
                currentLocation: s.currentLocation.name
            }))
        };

        return res.status(201).json({
            success: true,
            message: `${matches.length} optimal matches found using Hungarian Algorithm`,
            matches,
            costMatrix: costMatrixWithLabels,
            optimalAssignment
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});
