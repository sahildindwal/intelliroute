import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../GlobalContext";
import styles from "./Header.module.css";
import { Link, useNavigate } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { FaMapMarkerAlt, FaBus, FaCar, FaUser, FaUserCircle } from "react-icons/fa";
import { MdAdminPanelSettings, MdMap, MdLogin, MdPersonAdd } from "react-icons/md";
import Popup from "./PopUp";
import { AutoRedirect } from "./AutoRedirect";
import { clearUserNameFromStorage } from "../utilities/cookie.utility";

const Header = () => {
    <AutoRedirect/>
    const { state, dispatch } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);
    const [redirectTo, setRedirectTo] = useState(false);

    const handleLogout = () => {
        fetch(import.meta.env.VITE_BACKEND_URL + "/api/users/logout", {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    console.log(data.message);
                    // Clear localStorage immediately on successful logout
                    clearUserNameFromStorage();
                    console.log("Cleared userName from localStorage");
                    setPopUpContent(
                        <div>
                            <strong className={styles.success}>
                                {data.message}
                            </strong>
                            <p>Click Redirect to go to Login page</p>
                        </div>
                    );
                    setRedirectTo("/login");
                    setIsOpen(true);
                } else {
                    console.error("ERROR : ", data.message);
                }
            })
            .catch(() => {
                setPopUpContent("Some error occured");
                setIsOpen(true);
            });
    };

    return (
        <div className={styles.header}>
            <Link to="/" className={styles.appName}>
                <h1 className={styles.title}>IntelliRoute</h1>
            </Link>
            <div className={styles.buttons}>
                {!state.user ? (
                    <>
                        <Link to="/login" className={styles.button}>
                            <MdLogin className={styles.icon} />
                            <span className={styles.buttonText}>Login</span>
                        </Link>
                        <Link to="/signup" className={styles.button}>
                            <MdPersonAdd className={styles.icon} />
                            <span className={styles.buttonText}>Sign Up</span>
                        </Link>
                    </>
                ) : (
                    <>
                        {state.user?.role === "admin" ? (
                            <>
                                <Link to="/locations" className={styles.button}>
                                    <FaMapMarkerAlt className={styles.icon} />
                                    <span className={styles.buttonText}>Locations</span>
                                </Link>
                                <Link to="/shuttles" className={styles.button}>
                                    <FaBus className={styles.icon} />
                                    <span className={styles.buttonText}>Shuttles</span>
                                </Link>
                                <Link to="/ride-request" className={styles.button}>
                                    <MdAdminPanelSettings className={styles.icon} />
                                    <span className={styles.buttonText}>Manage</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/my-rides" className={styles.button}>
                                    <FaCar className={styles.icon} />
                                    <span className={styles.buttonText}>My Rides</span>
                                </Link>
                                <Link to="/view-locations" className={styles.button}>
                                    <FaMapMarkerAlt className={styles.icon} />
                                    <span className={styles.buttonText}>Locations</span>
                                </Link>
                            </>
                        )}
                        <Link to="/campus-map" className={styles.button}>
                            <MdMap className={styles.icon} />
                            <span className={styles.buttonText}>Map</span>
                        </Link>
                        <Link to="/profile" className={styles.button}>
                            <FaUserCircle className={styles.icon} />
                            <span className={styles.buttonText}>{state.userName || 'Profile'}</span>
                        </Link>
                        <a className={styles.button} onClick={handleLogout}>
                            <LuLogOut className={styles.icon} />
                            <span className={styles.buttonText}>Logout</span>
                        </a>
                    </>
                )}
                <button 
                    onClick={() => navigate(-1)} 
                    className={`${styles.button} ${styles.backButton}`}
                    title="Go Back"
                >
                    <img src="/backtrack.png" alt="Back" />
                </button>
            </div>
            <Popup
                isOpen={isOpen}
                onClose={() => {
                    setRedirectTo(false);
                    setIsOpen(false);
                    dispatch({ type: "REMOVE_USER" });
                    // localStorage already cleared on logout
                }}
                title="ALERT"
                redirectTo={redirectTo}
            >
                {popupContent}
            </Popup>
        </div>
    );
};

export default Header;
