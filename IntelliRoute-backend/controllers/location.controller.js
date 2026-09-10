import mongoose from "mongoose";
import { Location, Path } from "../models/models.js";
import { asyncHandler } from "../utilities/asyncHandler.utility.js";
import { errorHandler } from "../utilities/errorHandler.utility.js";
import { buildGraph, dijkstra } from "../utilities/dijkstra.utility.js";

// Create a new Location (Admin only)
export const addLocation = asyncHandler(async (req, res, next) => {
    try {
        const { name, code, latitude, longitude, type } = req.body;

        if (!name || !code)
            return next(
                new errorHandler("Location must have name and its code", 400)
            );

        const existingLocation = await Location.findOne({ code });
        if (existingLocation)
            return next(new errorHandler("Location code already exists", 400));

        const location = new Location({
            name,
            code,
            latitude,
            longitude,
            type,
        });
        console.log(location);
        await location.save();

        res.status(201).json({ success: true, message: location });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Batch Location Addition (Admin only)
export const addLocations = asyncHandler(async (req, res, next) => {
    try {
        const locations = req.body.locations;

        if (!locations || !Array.isArray(locations) || locations.length === 0)
            return next(new errorHandler("No locations provided", 400));

        // Basic validation of each location object
        for (const loc of locations) {
            if (!loc.name || !loc.code) {
                return next(
                    new errorHandler(
                        "Each location must have a name and code",
                        400
                    )
                );
            }
        }

        // Insert many locations; continue even if some duplicates cause errors
        const insertedLocations = await Location.insertMany(locations, {
            ordered: false,
        });

        res.status(201).json({
            success: true,
            message: `${insertedLocations.length} locations added successfully`,
            data: insertedLocations,
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Get all Locations
export const getLocations = asyncHandler(async (req, res, next) => {
    try {
        // Get all locations regardless of type
        const locations = await Location.find({}).sort({
            name: 1,
        });

        res.status(200).json({ success: true, message: locations });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Get all nodes (locations + turns)
export const getNodes = asyncHandler(async (req, res, next) => {
    try {
        const turns = await Location.find({ type: "NODE" }).sort({
            code: 1,
        });
        const locations = await Location.find({ type: { $ne: "NODE" } }).sort({
            code: 1,
        });

        res.status(200).json({ success: true, turns, locations });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Get Location by ID
export const getLocationByID = asyncHandler(async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(new errorHandler("Invalid ObjectId", 400));
        }
        const location = await Location.findById(req.params.id);
        if (!location) return next(new errorHandler("Location not found", 404));
        res.status(200).json({ success: true, message: location });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Update Location by ID (Admin only)
export const updateLocationByID = asyncHandler(async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(new errorHandler("Invalid ObjectId", 400));
        }

        const { name, code, latitude, longitude, type } = req.body;
        const location = await Location.findById(req.params.id);
        if (!location) return next(new errorHandler("Location not found", 404));

        if (name) location.name = name;
        if (code) location.code = code;
        if (latitude !== undefined) location.latitude = latitude;
        if (longitude !== undefined) location.longitude = longitude;
        if (type !== undefined) location.type = type;

        await location.save();
        res.status(201).json({ success: true, message: location });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Delete Location by ID (Admin only)
export const deleteLocationByID = asyncHandler(async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(new errorHandler("Invalid ObjectId", 400));
        }

        const location = await Location.findByIdAndDelete(req.params.id);
        if (!location) return next(new errorHandler("Location not found", 404));
        res.status(201).json({
            success: true,
            message: "Location deleted successfully",
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Create paths
export const addPaths = asyncHandler(async (req, res, next) => {
    try {
        const paths = req.body;

        if (!paths || !Array.isArray(paths) || paths.length === 0)
            return next(new errorHandler("No paths provided", 400));

        // Basic validation of each location object
        for (const path of paths) {
            if (!path.node1 || !path.node2) {
                return next(
                    new errorHandler(
                        "Each path must have two termainal nodes",
                        400
                    )
                );
            }
        }

        // Insert many paths; continue even if some duplicates cause errors
        const insertedPaths = await Path.insertMany(paths, {
            ordered: false,
        });

        res.status(201).json({
            success: true,
            message: `${insertedPaths.length} paths added successfully`,
            data: insertedPaths,
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Get all paths
export const getPaths = asyncHandler(async (req, res, next) => {
    try {
        const paths = await Path.find()
            .populate("node1", "name code latitude longitude")
            .populate("node2", "name code latitude longitude");
        res.status(200).json({ success: true, message: paths });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Get paths connected to the Location
export const getPathsForLoc = asyncHandler(async (req, res, next) => {
    try {
        const locId = req.params.id;
        
        const paths = await Path.find({
            $or: [{ node1: locId }, { node2: locId }],
        })
            .populate("node1", "name code latitude longitude")
            .populate("node2", "name code latitude longitude");      

        res.status(200).json({ success: true, message: paths });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Delete path by ID (Admin only)
export const deletePathByID = asyncHandler(async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(new errorHandler("Invalid ObjectId", 400));
        }

        const path = await Path.findByIdAndDelete(req.params.id);
        if (!path) return next(new errorHandler("Path not found", 404));
        
        res.status(200).json({
            success: true,
            message: "Path deleted successfully",
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});

// Calculate shortest path between two locations using Dijkstra
export const getShortestPath = asyncHandler(async (req, res, next) => {
    try {
        const { sourceId, destinationId } = req.body;

        if (!sourceId || !destinationId) {
            return next(new errorHandler("Source and destination are required", 400));
        }

        if (!mongoose.Types.ObjectId.isValid(sourceId) || !mongoose.Types.ObjectId.isValid(destinationId)) {
            return next(new errorHandler("Invalid location IDs", 400));
        }

        // Build graph
        const { graph, locationMap } = await buildGraph();

        // Check if locations exist in graph
        if (!graph[sourceId] || !graph[destinationId]) {
            return next(new errorHandler("One or both locations not found in graph", 404));
        }

        // Run Dijkstra's algorithm
        const result = dijkstra(graph, sourceId, destinationId);

        if (result.distance === Infinity || result.path.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No path exists between these locations",
                data: {
                    distance: null,
                    path: [],
                    pathDetails: []
                }
            });
        }

        // Get detailed path information
        const pathDetails = result.path.map(locId => ({
            _id: locId,
            name: locationMap[locId].name,
            code: locationMap[locId].code,
            latitude: locationMap[locId].latitude,
            longitude: locationMap[locId].longitude
        }));

        res.status(200).json({
            success: true,
            message: "Shortest path calculated successfully",
            data: {
                distance: result.distance,
                distanceInMeters: (result.distance * 1000).toFixed(2),
                path: result.path,
                pathDetails: pathDetails
            }
        });
    } catch (error) {
        next(new errorHandler(error.message, 500));
    }
});
