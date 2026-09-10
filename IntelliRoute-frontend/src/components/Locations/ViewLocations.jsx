import { useEffect, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { FaMapMarkerAlt } from "react-icons/fa";
import styles from "./LocationList.module.css";
import Popup from "../PopUp";

export function ViewLocations() {
    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/locations/",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!data.success) {
                console.error("ERROR : ", data.message);
                setPopUpContent(
                    <div>
                        <strong className={styles.fail}>{data.message}</strong>
                    </div>
                );
                setIsOpen(true);
                setIsLoading(false);
                return;
            }

            // Success
            console.log("Locations:", data.message);
            setLocations(data.message);
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            console.error(err);
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>Some error occurred</strong>
                </div>
            );
            setIsOpen(true);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    if (isLoading)
        return (
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "1.2rem",
                    color: "#555",
                }}
            >
                <div className="loader"></div>
                <p style={{ marginTop: "12px" }}>Fetching Locations...</p>
            </div>
        );

    return (
        <div className={styles.container}>
            <button onClick={fetchLocations} className={styles.button}>
                <HiOutlineRefresh />
                <p>Refresh</p>
            </button>
            
            {locations.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#888",
                        fontSize: "1.1rem",
                    }}
                >
                    No locations available
                </div>
            ) : (
                <div className={styles.cardContainer}>
                    {locations.map((loc) => {
                        const isTurn = loc.type === "NODE" || loc.type === "node";
                        const displayType = isTurn ? "Turn" : "Location";
                        
                        return (
                            <div key={loc._id} className={styles.card}>
                                <div className={styles.cardHead}>
                                    <h3>
                                        {loc.name}
                                    </h3>
                                    <span className={styles.locationCode}>
                                        {loc.code}
                                    </span>
                                </div>

                                {loc.latitude !== undefined &&
                                loc.longitude !== undefined ? (
                                    <>
                                        <p>
                                            <FaMapMarkerAlt style={{ marginRight: '5px' }} />
                                            {loc.latitude}, {loc.longitude}
                                        </p>
                                        <p>
                                            📋 Type: <strong style={{ color: isTurn ? '#f59e0b' : '#10b981' }}>{displayType}</strong>
                                        </p>
                                    </>
                                ) : (
                                    <p style={{ color: "gray" }}>Coordinates not available</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            
            <Popup
                isOpen={isOpen}
                onClose={() => {
                    setRedirectTo(false);
                    setIsOpen(false);
                }}
                title="ALERT"
                redirectTo={redirectTo}
            >
                {popupContent}
            </Popup>
        </div>
    );
}
