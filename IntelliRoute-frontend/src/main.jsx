// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import { GlobalProvider } from "./GlobalContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Profile from "./pages/Profile.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import UpdateProfile from "./pages/UpdateProfile.jsx";
import { ServiceLocation } from "./pages/ServiceLocation.jsx";
import { LocationList } from "./components/Locations/LocationList.jsx";
import { AddLocation } from "./components/Locations/AddLocation.jsx";
import { AddPath } from "./components/Locations/AddPath.jsx";
import { ViewPath } from "./components/Locations/ViewPath.jsx";
import { DeletePath } from "./components/Locations/DeletePath.jsx";
import { ShuttleService } from "./pages/ShuttleService.jsx";
import { AddShuttle } from "./components/Shuttles/AddShuttle.jsx";
import { ShuttleList } from "./components/Shuttles/ShuttleList.jsx";
import { RideRequestService } from "./pages/RideRequestService.jsx";
import { CreateRide } from "./components/Rides/CreateRide.jsx";
import { ViewRideHistory } from "./components/Rides/ViewRideHistory.jsx";
import { ViewLocations } from "./components/Locations/ViewLocations.jsx";
import { ViewAllRides } from "./components/Rides/ViewAllRides.jsx";
import Home from "./pages/Home.jsx";
import { StudentLocationService } from "./pages/StudentLocationService.jsx";
import { ViewLocationsStudent } from "./components/Locations/ViewLocationsStudent.jsx";
import { ViewPathStudent } from "./components/Locations/ViewPathStudent.jsx";

//! Creating router for our chat application
const routerMine = createBrowserRouter([
    {
        path: "/",
        element: <App />, // App is the layout
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute isProtected={false} allowPublic={true}>
                        <Home />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/signup",
                element: (
                    <ProtectedRoute isProtected={false}>
                        <Register />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/login",
                element: (
                    <ProtectedRoute isProtected={false}>
                        <Login />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/profile",
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/change-password",
                element: (
                    <ProtectedRoute>
                        <ChangePassword />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/update-profile",
                element: (
                    <ProtectedRoute>
                        <UpdateProfile />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/locations",
                element: (
                    <ProtectedRoute role="admin">
                        <ServiceLocation />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: "add",
                        element: (
                            <ProtectedRoute role="admin">
                                <AddLocation />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "view",
                        element: (
                            <ProtectedRoute role="admin">
                                <LocationList />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "add-path",
                        element: (
                            <ProtectedRoute role="admin">
                                <AddPath />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "view-path",
                        element: (
                            <ProtectedRoute role="admin">
                                <ViewPath />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "delete-path",
                        element: (
                            <ProtectedRoute role="admin">
                                <DeletePath />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
            {
                path: "/shuttles",
                element: (
                    <ProtectedRoute role="admin">
                        <ShuttleService />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: "add",
                        element: (
                            <ProtectedRoute role="admin">
                                <AddShuttle />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "view",
                        element: (
                            <ProtectedRoute role="admin">
                                <ShuttleList />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
            {
                path: "/ride-request",
                element: (
                    <ProtectedRoute role="admin">
                        <RideRequestService />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: "request",
                        element: (
                            <ProtectedRoute role="admin">
                                <CreateRide />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "view",
                        element: (
                            <ProtectedRoute role="admin">
                                <ViewAllRides />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
            {
                path: "/my-rides",
                element: (
                    <ProtectedRoute>
                        <RideRequestService />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: "request",
                        element: (
                            <ProtectedRoute>
                                <CreateRide />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "history",
                        element: (
                            <ProtectedRoute>
                                <ViewRideHistory />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
            {
                path: "/view-locations",
                element: (
                    <ProtectedRoute>
                        <StudentLocationService />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: "view",
                        element: (
                            <ProtectedRoute>
                                <ViewLocationsStudent />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "view-path",
                        element: (
                            <ProtectedRoute>
                                <ViewPathStudent />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
            {
                path: "/campus-map",
                element: (
                    <ProtectedRoute>
                        <ViewPathStudent />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

createRoot(document.getElementById("root")).render(
    // <StrictMode>
    <GlobalProvider>
        <RouterProvider router={routerMine} />
    </GlobalProvider>
    // </StrictMode>
);
