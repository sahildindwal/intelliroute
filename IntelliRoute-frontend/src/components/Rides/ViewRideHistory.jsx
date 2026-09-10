import { useEffect, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { MdCancel } from "react-icons/md";
import styles from "./ViewAllRides.module.css";
import Popup from "../PopUp";

export function ViewRideHistory() {
    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    const [rides, setRides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState("ALERT");

    const fetchUserRides = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/rides/user",
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
            console.log("User rides:", data.message);
            setRides(data.message);
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

    const cancelRide = async (rideId) => {
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + `/api/rides/cancel/${rideId}`,
                {
                    method: "PUT",
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
                setTitle("CANCELLATION ERROR");
                setIsOpen(true);
                return;
            }

            // Success
            setPopUpContent(
                <div>
                    <strong className={styles.success}>
                        Ride cancelled successfully
                    </strong>
                </div>
            );
            setTitle("SUCCESS");
            setIsOpen(true);

            // Refresh rides after cancellation
            setTimeout(() => {
                fetchUserRides();
            }, 1500);
        } catch (err) {
            console.error(err);
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>Error cancelling ride</strong>
                </div>
            );
            setTitle("ERROR");
            setIsOpen(true);
        }
    };

    useEffect(() => {
        fetchUserRides();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

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
                <p style={{ marginTop: "12px" }}>Fetching Your Rides...</p>
            </div>
        );

    return (
        <div className={styles.container}>
            <div className={styles.buttonGroup}>
                <button onClick={fetchUserRides} className={styles.button}>
                    <HiOutlineRefresh />
                    <p>Refresh</p>
                </button>
            </div>

            <div className={styles.belowExecute}>
                {rides.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#888",
                            fontSize: "1.1rem",
                        }}
                    >
                        No ride requests found. Request your first ride!
                    </div>
                ) : (
                    <div className={styles.cardContainer}>
                        {rides.map((ride) => (
                            <div key={ride._id} className={styles.card}>
                                <div className={styles.cardHead}>
                                    <h3>
                                        {ride.sourceLocation?.name || "Unknown"} →{" "}
                                        {ride.destinationLocation?.name || "Unknown"}
                                    </h3>
                                    <span
                                        className={`${styles.status} ${
                                            styles[ride.status]
                                        }`}
                                    >
                                        {ride.status}
                                    </span>
                                </div>

                                <p>
                                    📍 FROM:{" "}
                                    {ride.sourceLocation?.name
                                        ? `${ride.sourceLocation.name} (${ride.sourceLocation.code})`
                                        : "None"}
                                </p>
                                <p>
                                    📍 TO:{" "}
                                    {ride.destinationLocation?.name
                                        ? `${ride.destinationLocation.name} (${ride.destinationLocation.code})`
                                        : "None"}
                                </p>
                                <p>
                                    🕒 Requested: {formatDate(ride.requestTime)}
                                </p>
                                
                                {ride.assignedShuttleId && (
                                    <p>
                                        🚐 Shuttle: <strong>{ride.assignedShuttleId.shuttleNumber}</strong>
                                    </p>
                                )}
                                
                                {ride.assignedTime && (
                                    <p>
                                        ✅ Assigned: {formatDate(ride.assignedTime)}
                                    </p>
                                )}
                                
                                {ride.completionTime && (
                                    <p>
                                        🏁 Completed: {formatDate(ride.completionTime)}
                                    </p>
                                )}
                                
                                {ride.cancellationTime && (
                                    <p>
                                        ❌ Cancelled: {formatDate(ride.cancellationTime)}
                                    </p>
                                )}

                                {ride.status === "pending" && (
                                    <div className={styles.actions}>
                                        <button
                                            className={`${styles.button} ${styles.cancelBtn}`}
                                            onClick={() => cancelRide(ride._id)}
                                        >
                                            <MdCancel />
                                            <span>Cancel Ride</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Popup
                isOpen={isOpen}
                onClose={() => {
                    setRedirectTo(false);
                    setIsOpen(false);
                    setTimeout(() => {
                        setTitle("ALERT");
                    }, 190);
                }}
                title={title}
                redirectTo={redirectTo}
            >
                {popupContent}
            </Popup>
        </div>
    );
}
