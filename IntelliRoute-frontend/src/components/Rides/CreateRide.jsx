import { useContext, useEffect, useState } from "react";
import styles from "./CreateRide.module.css";
import Popup from "../PopUp";
import CustomDropdown from "../CustomDropdown";
import { ViewAllRides } from "./ViewAllRides";
import { GlobalContext } from "../../GlobalContext";
import RideRequestMap from "../Map/RideRequestMap";

export function CreateRide() {
    const { state } = useContext(GlobalContext);
    const isAdmin = state.user?.role === "admin";
    
    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    // 1 -> add single shuttle, 2 -> add multiple shuttles
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");

    const [locations, setLocations] = useState([]);
    const [turns, setTurns] = useState([]);
    const [pathInfo, setPathInfo] = useState(null);
    const [loadingPath, setLoadingPath] = useState(false);
    const [clickMode, setClickMode] = useState('source');

    const fetchLocations = async () => {
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/locations/nodes",
                { method: "GET", credentials: "include" }
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

            setLocations(data.locations);
            setTurns(data.turns);
        } catch (err) {
            console.error(err);
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>Some Error Occured</strong>
                </div>
            );
            setIsOpen(true);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    // Fetch shortest path when both source and destination are selected
    useEffect(() => {
        if (source && destination && source !== destination) {
            fetchShortestPath();
        } else {
            setPathInfo(null);
        }
    }, [source, destination]);

    const fetchShortestPath = async () => {
        setLoadingPath(true);
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/locations/shortest-path",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sourceId: source,
                        destinationId: destination,
                    }),
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!data.success) {
                console.error("ERROR : ", data.message);
                setPathInfo(null);
                setLoadingPath(false);
                return;
            }

            setPathInfo(data.data);
            setLoadingPath(false);
        } catch (err) {
            console.error(err);
            setPathInfo(null);
            setLoadingPath(false);
        }
    };

    const handleRequestAPI = async (e) => {
        e.preventDefault();

        //* API CALL
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/rides/request",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sourceLocation: source,
                        destinationLocation: destination,
                    }),
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
            setPopUpContent(
                <div>
                    <strong className={styles.success}>Ride requested successfully!</strong>
                </div>
            );
            setIsOpen(true);
        } catch (err) {
            console.error(err);
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>Some Error Occured</strong>
                </div>
            );
            setIsOpen(true);
        }

        setSource("");
        setDestination("");
    };

    return (
        <div className={styles.container}>
            {/* Interactive Map */}
            <section className={styles.mapCard}>
                <h2>📍 Interactive Campus Map</h2>
                <p className={styles.mapInstructions}>
                    Click on locations to select source and destination
                </p>
                <div className={styles.mapWrapper}>
                    <RideRequestMap
                        locations={locations}
                        turns={turns}
                        sourceId={source}
                        destinationId={destination}
                        onSourceSelect={setSource}
                        onDestinationSelect={setDestination}
                        pathInfo={pathInfo}
                        onClickModeChange={setClickMode}
                        height="100%"
                    />
                </div>
            </section>

            {/* Create a ride request */}
            <section className={styles.card}>
                <h2>Request A Ride</h2>
                
                {/* Mode indicator moved here */}
                <div className={styles.modeIndicator}>
                    <span className={styles.modeLabel}>Click map to set:</span>
                    <div className={styles.modeButtons}>
                        <span className={`${styles.modeSource} ${clickMode === 'source' ? styles.modeActive : ''}`}>
                            <span className={styles.modeDot}></span>
                            Source
                        </span>
                        <span className={styles.modeSeparator}>|</span>
                        <span className={`${styles.modeDestination} ${clickMode === 'destination' ? styles.modeActive : ''}`}>
                            <span className={styles.modeDot}></span>
                            Destination
                        </span>
                    </div>
                </div>

                <form className={styles.form}>
                    <div className={styles.formField}>
                        <label className={styles.label}>From: </label>
                        <CustomDropdown
                            content1={locations}
                            content2={turns}
                            selectedLocation={source}
                            setSelectedLocation={setSource}
                            type="Location"
                            save="_id"
                        />
                    </div>
                    <div className={styles.formField}>
                        <label className={styles.label}>To: </label>
                        <CustomDropdown
                            content1={locations}
                            content2={turns}
                            selectedLocation={destination}
                            setSelectedLocation={setDestination}
                            type="Location"
                            save="_id"
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.btn}
                        onClick={handleRequestAPI}
                    >
                        Request
                    </button>
                </form>

                {/* Display path information */}
                {loadingPath && (
                    <div className={styles.pathInfo}>
                        <p>Calculating route...</p>
                    </div>
                )}

                {pathInfo && pathInfo.pathDetails && pathInfo.pathDetails.length > 0 && (
                    <div className={styles.pathInfo}>
                        <h3>Route Information</h3>
                        <p className={styles.distance}>
                            📏 Total Distance: <strong>{pathInfo.distanceInMeters} m</strong>
                        </p>
                        <div className={styles.pathSteps}>
                            <h4>Path:</h4>
                            {pathInfo.pathDetails.map((location, index) => (
                                <div key={location._id} className={styles.pathStep}>
                                    <span className={styles.stepNumber}>{index + 1}</span>
                                    <span className={styles.stepName}>
                                        {location.name} ({location.code})
                                    </span>
                                    {index < pathInfo.pathDetails.length - 1 && (
                                        <span className={styles.arrow}>↓</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {pathInfo && pathInfo.pathDetails && pathInfo.pathDetails.length === 0 && (
                    <div className={styles.pathInfo}>
                        <p className={styles.noPath}>⚠️ No route available between these locations</p>
                    </div>
                )}
            </section>

            {/* Only show ViewAllRides for admin
            {isAdmin && <ViewAllRides />} */}

            {/*Pop up content*/}
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
