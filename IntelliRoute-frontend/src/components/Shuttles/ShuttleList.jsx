import { useEffect, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import styles from "./ShuttleList.module.css";
import Popup from "../PopUp";
import CustomDropdown from "../CustomDropdown";

export function ShuttleList() {
    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    const [shuttles, setShuttles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState("ALERT");
    const [id, setId] = useState(null);
    const [popupMode, setPopupMode] = useState(null);
    const [confirmOption, setConfirmOption] = useState(false);
    const [singleShuttle, setSingleShuttle] = useState({
        id: "",
        shuttleNumber: "",
        currentLocation: "",
    });
    const [selectedStatus, setSelectedStatus] = useState("");

    const [selectedLocation, setSelectedLocation] = useState("");
    const [locations, setLocations] = useState([]);
    const [turns, setTurns] = useState([]);

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

    const fetchShuttles = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/shuttles/",
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
            setShuttles(data.message);
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            console.error(err);
            setPopUpContent("Some error occured");
            setIsOpen(true);
        }
    };

    useEffect(() => {
        fetchShuttles();
    }, []);

    const fieldName = (field) => field.charAt(0).toUpperCase() + field.slice(1);
    const handleChange = (e) => {
        setSingleShuttle({
            ...singleShuttle,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdate = (shuttle) => {
        fetchLocations();
        setPopupMode("update");
        setTitle("UPDATE SHUTTLE");
        setSingleShuttle({
            id: shuttle._id,
            shuttleNumber: shuttle.shuttleNumber,
        });
        setSelectedStatus(shuttle.status);
        setSelectedLocation(shuttle.currentLocation._id);
        setIsOpen(true);
    };

    const handleUpdateAPI = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL +
                    `/api/shuttles/${singleShuttle.id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        shuttleNumber: singleShuttle.shuttleNumber,
                        currentLocation: selectedLocation,
                        status: selectedStatus,
                    }),
                }
            );

            const data = await res.json();

            if (!data.success) {
                setPopupMode("failure");
                console.error("ERROR : ", data.message);
                setPopUpContent(
                    <div>
                        <strong className={styles.fail}>{data.message}</strong>
                    </div>
                );
                return;
            }

            // Success
            setPopupMode("successUpdate");
        } catch (err) {
            setIsLoading(false);
            console.error(err);
            setPopupMode("error");
            if (!isOpen) setIsOpen(true);
        }
    };

    const handleDelete = (shuttle) => {
        setTitle("DELETE SHUTTLE");
        setId(shuttle._id);
        setConfirmOption(true);
        setPopupMode("deleteConfirm");
        setPopUpContent(`Want to delete ${shuttle.shuttleNumber}`);
        setIsOpen(true);
    };

    const handleDeleteAPI = async (id) => {
        // e.preventDefault();
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + `/api/shuttles/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!data.success) {
                console.error("ERROR : ", data.message);
                setPopupMode("failure");
                setConfirmOption(false);
                setPopUpContent(
                    <div>
                        <strong className={styles.fail}>{data.message}</strong>
                    </div>
                );
                return;
            }

            // Success
            setConfirmOption(false);
            setPopupMode("successDelete");
            // if (!isOpen) setIsOpen(true);
        } catch (err) {
            setIsLoading(false);
            setConfirmOption(false);
            console.error(err);
            setPopupMode("error");
            if (!isOpen) setIsOpen(true);
        }
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
                <p style={{ marginTop: "12px" }}>Fetching Shuttles...</p>
            </div>
        );

    return (
        <div className={styles.container}>
            <button onClick={fetchShuttles} className={styles.button}>
                <HiOutlineRefresh />
                <p>Refresh</p>
            </button>
            <div className={styles.cardContainer}>
                {shuttles.map((shuttle) => (
                    <div key={shuttle._id} className={styles.card}>
                        <div className={styles.cardHead}>
                            <h3>{shuttle.shuttleNumber}</h3>
                            <span
                                className={`${styles.status} ${
                                    styles[`${shuttle.status}`]
                                }`}
                            >
                                {shuttle.status}
                            </span>
                        </div>

                        {shuttle.currentLocation !== undefined &&
                        shuttle.status !== undefined ? (
                            <p>📍 {shuttle.currentLocation.name}</p>
                        ) : (
                            <p style={{ color: "gray" }}>
                                Shuttle location not available
                            </p>
                        )}

                        <div className={styles.actions}>
                            <button
                                className={`${styles.button} ${styles.updateBtn}`}
                                onClick={() => handleUpdate(shuttle)}
                            >
                                Update Location
                            </button>
                            <button
                                className={`${styles.button} ${styles.deleteBtn}`}
                                onClick={() => handleDelete(shuttle)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Popup
                id={id}
                isOpen={isOpen}
                cnfOption={confirmOption}
                onConfirm={handleDeleteAPI}
                onClose={() => {
                    setRedirectTo(false);
                    setIsOpen(false);
                    setTimeout(() => {
                        setTitle("ALERT");
                        setPopupMode(null);
                        setConfirmOption(false);
                    }, 190);
                    if (
                        popupMode === "successDelete" ||
                        popupMode === "successUpdate"
                    )
                        fetchShuttles();
                }}
                title={title}
                redirectTo={redirectTo}
            >
                {popupMode === "update" && (
                    <form className={styles.form}>
                        <div className={styles.formField}>
                            <label className={styles.label}>
                                Shuttle Number
                            </label>
                            <input
                                type="text"
                                name="shuttleNumber"
                                placeholder="e.g., SH001"
                                value={singleShuttle.shuttleNumber}
                                onChange={handleChange}
                                className={styles.input}
                                autoComplete="off"
                            />
                        </div>

                        <div className={styles.formField}>
                            <label className={styles.label}>
                                Current Location
                            </label>
                            <CustomDropdown
                                content1={locations}
                                content2={turns}
                                selectedLocation={selectedLocation}
                                setSelectedLocation={setSelectedLocation}
                                type="Location"
                                save="_id"
                            />
                        </div>

                        <div className={styles.formField}>
                            <label className={styles.label}>Status</label>
                            <CustomDropdown
                                content1={[
                                    { name: "active", _id: 1 },
                                    { name: "maintenance", _id: 2 },
                                    { name: "assigned", _id: 3 },
                                ]}
                                selectedLocation={selectedStatus}
                                setSelectedLocation={setSelectedStatus}
                                type="Status"
                                save="name"
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.buttonPopUp}
                            onClick={handleUpdateAPI}
                        >
                            Update
                        </button>
                    </form>
                )}

                {popupMode === "successUpdate" && (
                    <div>
                        <strong className={styles.success}>
                            Location updated successfully!
                        </strong>
                    </div>
                )}
                {popupMode === "successDelete" && (
                    <div>
                        <strong className={styles.success}>
                            Location deleted successfully!
                        </strong>
                    </div>
                )}
                {(popupMode === "failure" || popupMode === "deleteConfirm") &&
                    popupContent}
                {popupMode === "error" && (
                    <div>
                        <strong className={styles.fail}>
                            Some error occured
                        </strong>
                    </div>
                )}
            </Popup>
        </div>
    );
}
