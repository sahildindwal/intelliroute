import express from "express";
import {
    authenticateToken,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
    addLocation,
    addLocations,
    addPaths,
    deleteLocationByID,
    deletePathByID,
    getLocationByID,
    getLocations,
    getNodes,
    getPaths,
    getPathsForLoc,
    getShortestPath,
    updateLocationByID,
} from "../controllers/location.controller.js";

export const locationRouter = express.Router();

locationRouter.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    addLocation
);
locationRouter.post(
    "/batch",
    authenticateToken,
    authorizeRoles("admin"),
    addLocations
);
locationRouter.get("/", authenticateToken, getLocations);
locationRouter.get("/nodes", authenticateToken, getNodes);
locationRouter.get("/node/:id", authenticateToken, getLocationByID);
locationRouter.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    updateLocationByID
);
locationRouter.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteLocationByID
);

// Create paths
locationRouter.post(
    "/paths",
    authenticateToken,
    authorizeRoles("admin"),
    addPaths
);
// Get all paths - accessible to all authenticated users
locationRouter.get("/paths", authenticateToken, getPaths);
// Get path connected to a certain location - accessible to all authenticated users
locationRouter.get("/paths/:id", authenticateToken, getPathsForLoc);
// Delete path by ID - admin only
locationRouter.delete(
    "/paths/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deletePathByID
);
// Calculate shortest path using Dijkstra - accessible to all authenticated users
locationRouter.post("/shortest-path", authenticateToken, getShortestPath);
