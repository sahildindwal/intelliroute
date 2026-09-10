import { useEffect, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import styles from "./AddPath.module.css";
import Popup from "../PopUp";
import PathViewMap from "../Map/PathViewMap";

export function ViewPath() {
    const [isLoading, setIsLoading] = useState(true);
    const [locations, setLocations] = useState([]);
    const [turns, setTurns] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [fetchPath, setFetchPath] = useState(false);
    const [connections, createConnections] = useState([]);

    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    const fetchLocations = async () => {
        setIsLoading(true);
        createConnections([]);
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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleCardClick = (locId) => {
        setSelectedCard(locId);
        getPathsForLocation(locId);
    };

    //! Get all paths connecting that single location
    const getPathsForLocation = async (ID) => {
        // Calling API
        setFetchPath(true);
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + `/api/locations/paths/${ID}`,
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
                setFetchPath(false);
                return;
            }

            const message = data.message;
            // console.log(message);
            const locations = message.map(({ node1, node2 }) => {
                if (node1._id !== ID) return node1._id;
                else return node2._id;
            });
            // console.log(locations);
            createConnections(locations);
            setFetchPath(false);
        } catch (err) {
            console.error(err);
            setFetchPath(false);
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>Some Error Occured</strong>
                </div>
            );
            setIsOpen(true);
        }
    };

    const loader = (content) => (
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
            <p style={{ marginTop: "12px" }}>{content}</p>
        </div>
    );

    if (isLoading) loader("Fetching Locations...");

    const renderCard = (loc) => (
        <div
            key={loc._id}
            className={`${styles.card} ${
                selectedCard === loc._id ? styles.selected : ""
            }`}
            onClick={() => {
                handleCardClick(loc._id);
                getPathsForLocation(loc._id);
            }}
        >
            <h3>
                {loc.name} ({loc.code})
            </h3>

            {loc.latitude !== undefined && loc.longitude !== undefined ? (
                <p>
                    📍 {loc.latitude}, {loc.longitude}
                </p>
            ) : (
                <p style={{ color: "gray" }}>Location not set</p>
            )}
        </div>
    );

    const allNodes = (ID) => (
        <div
            className={styles.rightSelector}
            style={
                !selectedCard
                    ? {
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.2rem",
                      }
                    : null
            }
        >
            {fetchPath ? (
                loader("Fetching paths for the selected location")
            ) : !selectedCard ? (
                <div style={{ 
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#666'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                        Select a location from the left
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ flex: 1, marginBottom: '1rem' }}>
                        <PathViewMap 
                            locations={locations} 
                            turns={turns}
                            selectedLocationId={selectedCard}
                            connectedLocationIds={connections}
                            height="100%"
                        />
                    </div>
                    <div style={{ 
                        background: 'white', 
                        padding: '1rem', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>
                            Connected Locations ({connections.length})
                        </h3>
                        <ul className={styles["list"]}>
                            {connections.map((e) => (
                                <li key={e} style={{ padding: '0.25rem 0' }}>
                                    {locations.find((loc) => loc._id === e)?.name}
                                    {turns.find((loc) => loc._id === e)?.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.leftSelector}>
                <button
                    onClick={() => {
                        fetchLocations();
                        setSelectedCard(null);
                    }}
                    className={styles.button}
                >
                    <HiOutlineRefresh />
                    <p>Refresh</p>
                </button>

                <p className={styles["node-type"]}>Locations</p>
                <div className={styles.cardContainer}>
                    {locations.map(renderCard)}
                </div>

                <p className={styles["node-type"]}>Turns</p>
                <div className={styles.cardContainer}>
                    {turns.map(renderCard)}
                </div>
            </div>

            {allNodes(selectedCard)}

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
