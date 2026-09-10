import jwt from "jsonwebtoken";
import { errorHandler } from "../utilities/errorHandler.utility.js";
import { Session } from "../models/models.js";
import { clearCookie } from "../utilities/auth.utility.js";

const authenticateToken = (req, res, next) => {
    const token = req.cookies.loginToken || req.headers["authorization"];

    if (!token) return next(new errorHandler("Access token missing", 401));

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) return next(new errorHandler("Invalid token", 401));
        const session = await Session.findById(user.sessionId);
        if (!session) return next(new errorHandler("Trespassers not allowed"));
        if (!session.isActive) {
            clearCookie(res);
            return next(new errorHandler("Stale token", 401));
        }
        req.user = user;
        next();
    });
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler("Forbidden: Insufficient role", 403));
        }
        next();
    };
};

export { authenticateToken, authorizeRoles };
