import express from "express";
import {
    authenticateToken,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
    allRideRequests,
    cancelRide,
    matchRidesWithShuttles,
    requestRide,
    rideRequestByID,
    rideRequestHistory,
    updateRideStatus,
} from "../controllers/rideRequest.controller.js";

export const rideRequestRouter = express.Router();

rideRequestRouter.post("/request", authenticateToken, requestRide);
rideRequestRouter.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    allRideRequests
);
rideRequestRouter.get("/user", authenticateToken, rideRequestHistory);
rideRequestRouter.get("/:id", authenticateToken, rideRequestByID);
rideRequestRouter.put("/cancel/:id", authenticateToken, cancelRide);
rideRequestRouter.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    updateRideStatus
);

// Match routes
rideRequestRouter.post(
    "/match/execute",
    authenticateToken,
    authorizeRoles("admin"),
    matchRidesWithShuttles
);
