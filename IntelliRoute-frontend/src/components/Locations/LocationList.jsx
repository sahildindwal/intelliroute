import { useEffect, useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import styles from "./LocationList.module.css";
import Popup from "../PopUp";

export function LocationList() {
    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState("ALERT");
    const [id, setId] = useState(null);
    const [popupMode, setPopupMode] = useState(null);
    const [confirmOption, setConfirmOption] = useState(false);
    const [singleLocation, setSingleLocation] = useState({
        name: "",
        code: "",
        latitude: "",
        longitude: "",
        type: "",
    });

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
                return;
            }

            // Success
            console.log(data.message);
            setLocations(data.message);
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            console.error(err);
            setPopUpContent("Some error occured");
            setIsOpen(true);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const fieldName = (field) => field.charAt(0).toUpperCase() + field.slice(1);
    const handleChange = (e) => {
        console.log(e.target.name, e.target.value);

        setSingleLocation({
            ...singleLocation,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdate = (location) => {
        console.log(location);

        setPopupMode("update");
        setTitle("UPDATE LOCATION");
        setSingleLocation({
            id: location._id,
            name: location.name,
            code: location.code,
            latitude: location.latitude,
            longitude: location.longitude,
            type: location.type,
        });
        setIsOpen(true);
    };

    const handleUpdateAPI = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL +
                    `/api/locations/${singleLocation.id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(singleLocation),
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

    const handleDelete = (loc) => {
        setTitle("DELETE LOCATION");
        setId(loc._id);
        setConfirmOption(true);
        setPopupMode("deleteConfirm");
        setPopUpContent(`Want to delete ${loc.name}`);
        setIsOpen(true);
    };

    const handleDeleteAPI = async (id) => {
        // e.preventDefault();
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + `/api/locations/${id}`,
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
                <p style={{ marginTop: "12px" }}>Fetching Locations...</p>
            </div>
        );

    return (
        <div className={styles.container}>
            <button onClick={fetchLocations} className={styles.button}>
                <HiOutlineRefresh />
                <p>Refresh</p>
            </button>
            <div className={styles.gridc}>
                <div className={styles.cardContainer}>
                    {locations.map((loc) => (
                        <div key={loc._id} className={styles.card}>
                            <h3>
                                {loc.name} ({loc.code})
                            </h3>

                            {loc.latitude !== undefined &&
                            loc.longitude !== undefined ? (
                                <p>
                                    📍 {loc.latitude}, {loc.longitude}
                                </p>
                            ) : (
                                <p style={{ color: "gray" }}>
                                    Location not set
                                </p>
                            )}

                            <div className={styles.actions}>
                                <button
                                    className={`${styles.button} ${styles.updateBtn}`}
                                    onClick={() => handleUpdate(loc)}
                                >
                                    Update Location
                                </button>
                                <button
                                    className={`${styles.button} ${styles.deleteBtn}`}
                                    onClick={() => handleDelete(loc)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Popup
                id={id}
                isOpen={isOpen}
                cnfOption={confirmOption}
                onConfirm={handleDeleteAPI}
                onClose={() => {
                    setRedirectTo(false);
                    setTitle("ALERT");
                    setIsOpen(false);
                    setTimeout(() => {
                        setPopupMode(null);
                        setConfirmOption(false);
                    }, 190);
                    if (
                        popupMode === "successDelete" ||
                        popupMode === "successUpdate"
                    )
                        fetchLocations();
                }}
                title={title}
                redirectTo={redirectTo}
            >
                {popupMode === "update" && (
                    <form className={styles.form}>
                        {[
                            { field: "name", type: "text" },
                            { field: "code", type: "text" },
                            { field: "latitude", type: "number" },
                            { field: "longitude", type: "number" },
                            { field: "type", type: "text" },
                        ].map(({ field, type }) => (
                            <div className={styles.formField} key={field}>
                                <label className={styles.label}>
                                    {fieldName(field)}
                                </label>
                                <input
                                    type={type}
                                    name={field}
                                    placeholder={fieldName(field)}
                                    value={singleLocation[field]}
                                    onChange={handleChange}
                                    className={styles.input}
                                    autoComplete="off"
                                />
                            </div>
                        ))}

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
