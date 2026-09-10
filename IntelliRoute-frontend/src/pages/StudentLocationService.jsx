import { useContext } from "react";
import { GlobalContext } from "../GlobalContext";
import styles from "./ServiceLocation.module.css";
import { AutoRedirect } from "../components/AutoRedirect";
import { NavLink, Outlet } from "react-router-dom";

export const StudentLocationService = () => {
    const { state } = useContext(GlobalContext);

    return (
        <div className={styles.locationPage}>
            <div className={styles.heading}>Campus Locations</div>
            <div className={styles.locationContainer}>
                <AutoRedirect />
                <div className={styles.leftContent}>
                    <nav className={styles.cardGrid}>
                        <NavLink
                            to="view"
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.card} ${styles.activeCard}`
                                    : styles.card
                            }
                        >
                            <h3>View Locations</h3>
                        </NavLink>

                        <NavLink
                            to="view-path"
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.card} ${styles.activeCard}`
                                    : styles.card
                            }
                        >
                            <h3>View Paths</h3>
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
