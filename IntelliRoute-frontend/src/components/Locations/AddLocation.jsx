import { useState } from "react";
import styles from "./AddLocation.module.css";
import Popup from "../PopUp";

export function AddLocation() {
    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    const [singleLocation, setSingleLocation] = useState({
        name: "",
        code: "",
        latitude: "",
        longitude: "",
        type: "",
    });

    const [bulkText, setBulkText] = useState("");

    // ✅ Handle Single Location Submit
    const submitSingle = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/locations/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(singleLocation),
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
                    <strong className={styles.success}>
                        Location added successfully
                    </strong>
                </div>
            );
            setIsOpen(true);
        } catch (err) {
            console.error(err);
            setPopUpContent("Some error occured");
            setIsOpen(true);
        }

        setSingleLocation({
            name: "",
            code: "",
            latitude: "",
            longitude: "",
            type: "",
        });
    };

    // ✅ Handle Bulk Submit inside a form
    const submitBulk = async (e) => {
        e.preventDefault();

        const lines = bulkText.split("\n").map((line) => {
            const [name, code, latitude = 0, longitude = 0, type = "LOCATION"] =
                line.split(",");
            return {
                name: name?.trim(),
                code: code?.trim(),
                latitude,
                longitude,
                type,
            };
        });

        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/locations/batch",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ locations: lines }),
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
                    <strong className={styles.success}>{data.message}</strong>
                </div>
            );
            setIsOpen(true);
        } catch (err) {
            console.error(err);
            setPopUpContent("Some error occured");
            setIsOpen(true);
        }

        setBulkText("");
    };

    const handleChange = (e) => {
        setSingleLocation({
            ...singleLocation,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className={styles.container}>
            {/* ✅ Add Single Location */}
            <section className={styles.card}>
                <h2>Add Single Location</h2>
                <form
                    onSubmit={submitSingle}
                    className={styles.form}
                    autoComplete="off"
                >
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        className={styles.input}
                        value={singleLocation.name}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    <input
                        type="text"
                        name="code"
                        placeholder="Code"
                        className={styles.input}
                        value={singleLocation.code}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    <input
                        type="number"
                        step="off"
                        name="latitude"
                        placeholder="Latitude"
                        className={styles.input}
                        value={singleLocation.latitude}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    <input
                        type="number"
                        step="any"
                        name="longitude"
                        placeholder="Longitude"
                        className={styles.input}
                        value={singleLocation.longitude}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    <input
                        type="text"
                        name="type"
                        placeholder="Type"
                        className={styles.input}
                        value={singleLocation.type}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    <button type="submit" className={styles.btn}>
                        Add
                    </button>
                </form>
            </section>

            {/* ✅ Add Multiple Locations */}
            <section className={styles.card}>
                <h2>Add Multiple Locations</h2>
                <form
                    onSubmit={submitBulk}
                    className={styles.form}
                    autoComplete="off"
                >
                    <p className={styles.help}>
                        Format:{" "}
                        <b>
                            Name, Code, Latitude(optional), Longitude(optional),
                            <br />
                            Type['LOCATION', 'NODE']
                        </b>
                    </p>

                    <textarea
                        className={styles.textarea}
                        placeholder={`Example:
Lib,LIB,25.3,82.9,LOCATION
Gate1,G1`}
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        required
                        autoComplete="off"
                    />

                    <button type="submit" className={styles.btnSecondary}>
                        Add All
                    </button>
                </form>
            </section>

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
