import { useContext } from "react";
import { GlobalContext } from "../GlobalContext";
import styles from "./ServiceLocation.module.css";
import { AutoRedirect } from "../components/AutoRedirect";
import { NavLink, Outlet } from "react-router-dom";

export const RideRequestService = () => {
    const { state } = useContext(GlobalContext);
    const isAdmin = state.user?.role === "admin";

    return (
        <div className={styles.locationPage}>
            <div className={styles.heading}>
                {isAdmin ? "Ride Request Management" : "My Rides"}
            </div>
            <div className={styles.locationContainer}>
                <AutoRedirect />
                <div className={styles.leftContent}>
                    <nav className={styles.cardGrid}>
                        <NavLink
                            to="request"
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.card} ${styles.activeCard}`
                                    : styles.card
                            }
                        >
                            <h3>Request Ride</h3>
                        </NavLink>
                        <NavLink
                            to={isAdmin ? "view" : "history"}
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.card} ${styles.activeCard}`
                                    : styles.card
                            }
                        >
                            <h3>
                                {isAdmin ? "View All Ride Requests" : "My Ride History"}
                            </h3>
                        </NavLink>
                    </nav>
                </div>

                <div className={styles.rightContent}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
