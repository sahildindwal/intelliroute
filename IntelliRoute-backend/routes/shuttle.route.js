import express from "express";
import {
    authenticateToken,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
    addShuttle,
    addShuttles,
    deleteShuttle,
    getAllShuttles,
    getShuttle,
    updateShuttle,
} from "../controllers/shuttle.controller.js";

export const shuttleRouter = express.Router();

shuttleRouter.post("/", authenticateToken, authorizeRoles("admin"), addShuttle);
shuttleRouter.post("/batch", authenticateToken, authorizeRoles("admin"), addShuttles);
shuttleRouter.get("/", authenticateToken, getAllShuttles);
shuttleRouter.get("/:id", authenticateToken, getShuttle);
shuttleRouter.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    updateShuttle
);
shuttleRouter.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteShuttle
);
