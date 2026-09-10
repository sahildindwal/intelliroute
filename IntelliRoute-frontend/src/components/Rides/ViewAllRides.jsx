import { useEffect, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { MdAutoGraph } from "react-icons/md";
import styles from "./ViewAllRides.module.css";
import Popup from "../PopUp";

export function ViewAllRides() {
    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    const [rides, setRides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState("ALERT");
    const [matchingData, setMatchingData] = useState(null);
    const [showCostMatrix, setShowCostMatrix] = useState(false);

    const fetchRides = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/rides/",
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
                return;
            }

            // Success
            console.log(data.message);
            setRides(data.message);
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            console.error(err);
            setPopUpContent("Some error occured");
            setIsOpen(true);
        }
    };

    const executeMatching = async () => {
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/rides/match/execute",
                {
                    method: "POST",
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
                setTitle("MATCHING ERROR");
                setIsOpen(true);
                return;
            }

            // Success - display matching results
            console.log("Matching data:", data);
            setMatchingData(data);
            setShowCostMatrix(true);
            setPopUpContent(
                <div>
                    <strong className={styles.success}>{data.message}</strong>
                </div>
            );
            setTitle("MATCHING SUCCESS");
            setIsOpen(true);

            // Refresh rides after matching
            setTimeout(() => {
                fetchRides();
            }, 2000);
        } catch (err) {
            console.error(err);
            setPopUpContent("Error executing matching algorithm");
            setTitle("ERROR");
            setIsOpen(true);
        }
    };

    useEffect(() => {
        fetchRides();
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
                <p style={{ marginTop: "12px" }}>Fetching Rides...</p>
            </div>
        );

    return (
        <div className={styles.container}>
            <div className={styles.buttonGroup}>
                <button onClick={fetchRides} className={styles.button}>
                    <HiOutlineRefresh />
                    <p>Refresh</p>
                </button>
                <button
                    onClick={executeMatching}
                    className={`${styles.button} ${styles.matchButton}`}
                >
                    <MdAutoGraph />
                    <p>Execute Matching</p>
                </button>
            </div>

            <div className={styles.belowExecute}>
                {showCostMatrix && matchingData && (
                    <div className={styles.costMatrixContainer}>
                        <h2>Cost Matrix & Optimal Assignment</h2>
                        <button
                            onClick={() => setShowCostMatrix(false)}
                            className={styles.closeMatrixBtn}
                        >
                            ✕ Close
                        </button>

                        <div className={styles.matrixWrapper}>
                            <table className={styles.costMatrix}>
                                <thead>
                                    <tr>
                                        <th>Ride (Source → Dest)</th>
                                        {matchingData.costMatrix.shuttleLabels.map(
                                            (shuttle) => (
                                                <th key={shuttle.index}>
                                                    {shuttle.shuttleNumber}
                                                    <br />
                                                    <small>
                                                        (
                                                        {
                                                            shuttle.currentLocation
                                                        }
                                                        )
                                                    </small>
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {matchingData.costMatrix.matrix.map(
                                        (row, rideIdx) => (
                                            <tr key={rideIdx}>
                                                <td
                                                    className={styles.rideLabel}
                                                >
                                                    <strong>
                                                        Ride {rideIdx + 1}
                                                    </strong>
                                                    <br />
                                                    <small>
                                                        {
                                                            matchingData
                                                                .costMatrix
                                                                .rideLabels[
                                                                rideIdx
                                                            ].source
                                                        }{" "}
                                                        →{" "}
                                                        {
                                                            matchingData
                                                                .costMatrix
                                                                .rideLabels[
                                                                rideIdx
                                                            ].destination
                                                        }
                                                    </small>
                                                </td>
                                                {row.map((cost, shuttleIdx) => {
                                                    const isOptimal =
                                                        matchingData.optimalAssignment.some(
                                                            (a) =>
                                                                a.rideIndex ===
                                                                    rideIdx &&
                                                                a.shuttleIndex ===
                                                                    shuttleIdx
                                                        );
                                                    return (
                                                        <td
                                                            key={shuttleIdx}
                                                            className={
                                                                isOptimal
                                                                    ? styles.optimalCell
                                                                    : ""
                                                            }
                                                        >
                                                            {cost ===
                                                            Number.MAX_SAFE_INTEGER
                                                                ? "∞"
                                                                : cost.toFixed(
                                                                      2
                                                                  )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.assignmentInfo}>
                            <h3>Optimal Assignments</h3>
                            <ul>
                                {matchingData.optimalAssignment.map(
                                    (assignment, idx) => (
                                        <li key={idx}>
                                            <strong>
                                                Ride {assignment.rideIndex + 1}
                                            </strong>{" "}
                                            →
                                            <strong>
                                                {" "}
                                                Shuttle{" "}
                                                {
                                                    matchingData.costMatrix
                                                        .shuttleLabels[
                                                        assignment.shuttleIndex
                                                    ].shuttleNumber
                                                }
                                            </strong>{" "}
                                            (Cost: {assignment.cost.toFixed(2)}{" "}
                                            km)
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                <div className={styles.cardContainer}>
                    {rides.map((ride) => (
                        <div key={ride._id} className={styles.card}>
                            <div className={styles.cardHead}>
                                <h3>{ride.userId.name}</h3>
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
                                    ? ride.sourceLocation.name
                                    : "None"}
                            </p>
                            <p>
                                📍 TO:{" "}
                                {ride.destinationLocation?.name
                                    ? ride.destinationLocation.name
                                    : "None"}
                            </p>
                            {ride.assignedShuttleId && (
                                <p>
                                    🚐 Shuttle: <strong>{ride.assignedShuttleId.shuttleNumber}</strong>
                                </p>
                            )}
                        </div>
                    ))}
                </div>
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
