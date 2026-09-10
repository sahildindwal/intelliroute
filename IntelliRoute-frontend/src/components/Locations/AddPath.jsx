import { useEffect, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import styles from "./AddPath.module.css";
import Popup from "../PopUp";

export function AddPath() {
    const [isLoading, setIsLoading] = useState(true);
    const [locations, setLocations] = useState([]);
    const [turns, setTurns] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null); // track selected ID
    const [checkedItems, setCheckedItems] = useState(new Set()); // track checked nodes
    const [disabledItems, setDisabledItems] = useState(new Set());
    const [fetchPath, setFetchPath] = useState(false);
    const [isAddingPaths, setAddingPaths] = useState(false);

    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    const fetchLocations = async () => {
        setIsLoading(true);
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
                    <strong className={styles.fail}>
                        Some Error Occured
                    </strong>
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
        setCheckedItems(new Set());
    };

    const handleCheckboxChange = (id) => {
        setCheckedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handlePaths = async () => {
        if (!selectedCard) {
            alert("Please select a location or turn first!");
            return;
        }

        setAddingPaths(true);

        const pairs = Array.from(
            new Set([...checkedItems].filter((e) => !disabledItems.has(e)))
        ).map((checkedId) => {
            return {
                node1: selectedCard,
                node2: checkedId,
            };
        });

        // Calling API
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/locations/paths",
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(pairs),
                }
            );

            const data = await res.json();
            if (!data.success) {
                setAddingPaths(false);
                console.error("ERROR : ", data.message);
                setPopUpContent(
                    <div>
                        <strong className={styles.fail}>{data.message}</strong>
                    </div>
                );
                setIsOpen(true);
                return;
            }

            setAddingPaths(false);
            fetchLocations();
            getPathsForLocation(selectedCard);
            console.log(data.message);
            setPopUpContent(
                <div>
                    <strong className={styles.success}>{data.message}</strong>
                </div>
            );
            setIsOpen(true);
        } catch (err) {
            setAddingPaths(false);
            console.error(err);
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>
                        Some Error Occured
                    </strong>
                </div>
            );
            setIsOpen(true);
        }
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
            setCheckedItems(new Set(locations));
            setDisabledItems(new Set(locations));
            setFetchPath(false);
        } catch (err) {
            console.error(err);
            setFetchPath(false);
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>
                        Some Error Occured
                    </strong>
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
                          fontSize: "2rem",
                      }
                    : null
            }
        >
            {isAddingPaths ? (
                loader("Adding Paths")
            ) : fetchPath ? (
                loader("Fetching paths for the selected location")
            ) : !selectedCard ? (
                "Select a location from the left"
            ) : (
                <>
                    <h3>Selected Card ID = {ID}</h3>
                    <ul className={styles["checkbox-group"]}>
                        {turns.map((turn) => (
                            <li key={turn._id}>
                                <input
                                    type="checkbox"
                                    id={turn._id}
                                    name="options"
                                    checked={checkedItems.has(turn._id)}
                                    disabled={disabledItems.has(turn._id)}
                                    onChange={() =>
                                        handleCheckboxChange(turn._id)
                                    }
                                />
                                <label htmlFor={turn._id}>
                                    {turn.code} - {turn.name}
                                </label>
                            </li>
                        ))}
                    </ul>
                    <ul className={styles["checkbox-group"]}>
                        {locations
                            .filter((loc) => loc._id !== selectedCard)
                            .map((loc) => (
                                <li key={loc._id}>
                                    <input
                                        type="checkbox"
                                        id={loc._id}
                                        name="options"
                                        checked={checkedItems.has(loc._id)}
                                        disabled={disabledItems.has(loc._id)}
                                        onChange={() =>
                                            handleCheckboxChange(loc._id)
                                        }
                                    />
                                    <label htmlFor={loc._id}>
                                        {loc.code} - {loc.name}
                                    </label>
                                </li>
                            ))}
                    </ul>
                    <button className={styles.button} onClick={handlePaths}>
                        Create Path
                    </button>
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
