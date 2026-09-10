import mongoose from "mongoose";
import { errorHandler } from "../utilities/errorHandler.utility.js";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    phoneNumber: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    loginDateTime: { type: Date, default: Date.now },
    browser: { type: String },
    ipAddress: { type: String },
    location: { type: String }, // Can be city/country or geolocation string
    isActive: { type: Boolean, default: true },
});

const Session = mongoose.model("Session", SessionSchema);

const LocationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    latitude: { type: Number },
    longitude: { type: Number },
    type: { type: String, default: "LOCATION" },
});

const Location = mongoose.model("Location", LocationSchema);

const PathSchema = new mongoose.Schema({
    node1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
    },
    node2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
    },
});

PathSchema.pre("insertMany", async function (next, docs) {
    for (const doc of docs) {
        const node1Exists = await mongoose
            .model("Location")
            .exists({ _id: doc.node1 });
        const node2Exists = await mongoose
            .model("Location")
            .exists({ _id: doc.node1 });
        if (!node1Exists || !node2Exists)
            return next(new errorHandler("Invalid location references", 400));
    }

    next();
});

const Path = mongoose.model("Path", PathSchema);

const ShuttleSchema = new mongoose.Schema({
    shuttleNumber: { type: String, required: true, unique: true },
    currentLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "maintenance", "assigned"],
        default: "active",
    },
    routeAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }],
});

ShuttleSchema.pre("save", async function (next) {
    const currLocationExists = await mongoose
        .model("Location")
        .exists({ _id: this.currentLocation });
    if (!currLocationExists)
        return next(new errorHandler("Invalid location reference", 400));

    if (!this.routeAssigned || this.routeAssigned.length === 0) return next();

    const uniqueLoc = [...new Set(this.routeAssigned.map((id) => String(id)))];

    const count = await mongoose.model("Location").countDocuments({
        _id: { $in: uniqueLoc },
    });

    if (count !== uniqueLoc.length) {
        return next(
            new errorHandler("Some location references are invalid", 400)
        );
    }

    next();
});

ShuttleSchema.pre("insertMany", async function (next, docs) {
    for (const doc of docs) {
        const currLocationExists = await mongoose
            .model("Location")
            .exists({ _id: doc.currentLocation });
        if (!currLocationExists)
            return next(new errorHandler("Invalid location reference", 400));

        if (!doc.routeAssigned || doc.routeAssigned.length === 0) continue;

        const uniqueLoc = [
            ...new Set(doc.routeAssigned.map((id) => String(id))),
        ];

        const count = await mongoose.model("Location").countDocuments({
            _id: { $in: uniqueLoc },
        });

        if (count !== uniqueLoc.length) {
            return next(
                new errorHandler("Some location references are invalid", 400)
            );
        }
    }

    next();
});

const Shuttle = mongoose.model("Shuttle", ShuttleSchema);

const RideRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sourceLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
    },
    destinationLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
    },
    requestTime: { type: Date, default: Date.now },
    assignedTime: { type: Date },
    cancellationTime: { type: Date },
    completionTime: { type: Date },
    status: {
        type: String,
        enum: ["pending", "matched", "cancelled", "completed"],
        default: "pending",
    },
    assignedShuttleId: { type: mongoose.Schema.Types.ObjectId, ref: "Shuttle" },
});

RideRequestSchema.pre("save", async function (next) {
    const sourceExists = await mongoose
        .model("Location")
        .exists({ _id: this.sourceLocation });
    if (!sourceExists)
        return next(new errorHandler("Invalid source location reference", 400));

    const destinationExists = await mongoose
        .model("Location")
        .exists({ _id: this.destinationLocation });
    if (!destinationExists)
        return next(
            new errorHandler("Invalid destination location reference", 400)
        );

    if (this.assignedShuttleId) {
        const shuttleExists = await mongoose
            .model("Shuttle")
            .exists({ _id: this.assignedShuttleId });
        if (!shuttleExists)
            return next(new errorHandler("Invalid shuttle reference", 400));
    }

    next();
});

const RideRequest = mongoose.model("RideRequest", RideRequestSchema);

export { User, Session, Location, Path, Shuttle, RideRequest };
