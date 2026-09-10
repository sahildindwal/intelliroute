import { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { GlobalContext } from "../GlobalContext";
import { getUserNameFromCookie } from "../utilities/cookie.utility";

export default function ProtectedRoute({
    children,
    isProtected = true,
    allowPublic = false,
    role = "student",
}) {
    const { state, dispatch } = useContext(GlobalContext);

    useEffect(() => {
        if (!state.user) {
            dispatch({ type: "LOADING_USER" });

            fetch(import.meta.env.VITE_BACKEND_URL + "/api/users/check-user", {
                method: "GET",
                credentials: "include",
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        console.log(data.user);
                        dispatch({ type: "SET_USER", payload: data.user });
                        // Also set userName from cookie after successful auth check
                        const userName = getUserNameFromCookie();
                        if (userName) {
                            console.log("Setting userName from cookie:", userName);
                            dispatch({ type: "SET_USER_NAME", payload: userName });
                        } else {
                            console.log("No userName cookie found");
                        }
                    } else {
                        console.log(data.message);
                        dispatch({ type: "REMOVE_USER" });
                    }
                })
                .catch(() => dispatch({ type: "REMOVE_USER" }));
        }
    }, []);

    if (state.loading) {
        return (
            <div
                style={{
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "1.2rem",
                    color: "#555",
                }}
            >
                <div className="loader"></div>
                <p style={{ marginTop: "12px" }}>Checking authentication...</p>
            </div>
        );
    }

    if (isProtected && !state.user && state.autoRedirect) {
        return <Navigate to="/login" replace />;
    }

    if (!isProtected && state.user && state.autoRedirect && !allowPublic) {
        return <Navigate to="/profile" replace />;
    }

    // Check if user exists before checking role
    if (state.user) {
        // Admin-only routes: block students
        if (role === "admin" && state.user.role !== "admin") {
            return (
                <div
                    style={{
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "2rem",
                        color: "#555",
                    }}
                >
                    <p style={{ marginTop: "12px" }}>
                        Unauthorized: Admin access only
                    </p>
                </div>
            );
        }
    }

    return children;
}
