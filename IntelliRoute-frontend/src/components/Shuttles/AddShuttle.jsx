import { useEffect, useState } from "react";
import styles from "./AddShuttle.module.css";
import Popup from "../PopUp";
import CustomDropdown from "../CustomDropdown";
import { MdOutlineRemoveCircle } from "react-icons/md";

export function AddShuttle() {
    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    // 1 -> add single shuttle, 2 -> add multiple shuttles
    const [singleShuttleNo1, setSingleShuttleNo1] = useState("");
    const [singleShuttleNo2, setSingleShuttleNo2] = useState("");
    const [selectedLocation1, setSelectedLocation1] = useState("");
    const [selectedLocation2, setSelectedLocation2] = useState("");
    const [selectedStatus1, setSelectedStatus1] = useState(null);
    const [selectedStatus2, setSelectedStatus2] = useState(null);

    const [locations, setLocations] = useState([]);
    const [turns, setTurns] = useState([]);

    const [tray, setTray] = useState([]);

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

    const handleChange1 = (e) => setSingleShuttleNo1(e.target.value);
    const handleChange2 = (e) => setSingleShuttleNo2(e.target.value);

    const submitSingle = async (e) => {
        e.preventDefault();

        //* API CALL
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/shuttles/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        shuttleNumber: singleShuttleNo1,
                        currentLocation: selectedLocation1,
                        status: selectedStatus1,
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
                    <strong className={styles.success}>
                        Shuttle added successfully
                    </strong>
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

        setSingleShuttleNo1("");
        setSelectedLocation1("");
        setSelectedStatus1(null);
    };

    const submitMultiple = async (e) => {
        e.preventDefault();

        //* API CALL
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/shuttles/batch",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        shuttles: tray,
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
                    <strong className={styles.success}>{data.message}</strong>
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

        setSingleShuttleNo2("");
        setSelectedLocation2("");
        setSelectedStatus2(null);

        setTray([]);
    };

    const addToTray = (e) => {
        e.preventDefault();
        if (!singleShuttleNo2 || !selectedLocation2) {
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>
                        Each shuttle must have shuttle no, and current location
                    </strong>
                </div>
            );
            setIsOpen(true);
            return;
        }

        setTray((prev) => {
            prev.push({
                id: prev.length + 1,
                shuttleNumber: singleShuttleNo2,
                currentLocation: selectedLocation2,
                status: selectedStatus2,
            });
            return prev;
        });
        setSingleShuttleNo2("");
        setSelectedLocation2("");
        setSelectedStatus2(null);
    };

    const handleRemoveFromTray = (id) => {
        setTray((prev) => {
            return prev.filter((item) => item.id !== id);
        });
    };

    return (
        <div className={styles.container}>
            {/* Add Single Shuttle */}
            <section className={styles.card}>
                <h2>Add Single Shuttle</h2>
                <form
                    onSubmit={submitSingle}
                    className={styles.form}
                    autoComplete="off"
                >
                    <input
                        type="text"
                        name="shuttleNumber"
                        placeholder="Shuttle Number"
                        className={styles.input}
                        value={singleShuttleNo1}
                        onChange={handleChange1}
                        autoComplete="off"
                    />
                    <CustomDropdown
                        content1={locations}
                        content2={turns}
                        selectedLocation={selectedLocation1}
                        setSelectedLocation={setSelectedLocation1}
                        type="Location"
                        save="_id"
                    />
                    <CustomDropdown
                        content1={[
                            { name: "active", _id: 1 },
                            { name: "maintenance", _id: 2 },
                            { name: "assigned", _id: 3 },
                        ]}
                        selectedLocation={selectedStatus1}
                        setSelectedLocation={setSelectedStatus1}
                        type="Status"
                        save="name"
                    />
                    <button type="submit" className={styles.btn}>
                        Add Shuttle
                    </button>
                </form>
            </section>

            {/* ✅ Add Multiple Locations */}
            <section className={styles.multipleShuttle}>
                <section className={styles.card}>
                    <h2>Add Multiple Shuttles</h2>
                    <form
                        onSubmit={addToTray}
                        className={styles.form}
                        autoComplete="off"
                    >
                        <input
                            type="text"
                            name="shuttleNumber"
                            placeholder="Shuttle Number"
                            className={styles.input}
                            value={singleShuttleNo2}
                            onChange={handleChange2}
                            autoComplete="off"
                        />
                        <CustomDropdown
                            content1={locations}
                            content2={turns}
                            selectedLocation={selectedLocation2}
                            setSelectedLocation={setSelectedLocation2}
                            type="Location"
                            save="_id"
                        />
                        <CustomDropdown
                            content1={[
                                { name: "active", _id: 1 },
                                { name: "maintenance", _id: 2 },
                                { name: "assigned", _id: 3 },
                            ]}
                            selectedLocation={selectedStatus2}
                            setSelectedLocation={setSelectedStatus2}
                            type="Status"
                            save="name"
                        />
                        <button type="submit" className={styles.btnSecondary}>
                            Add In Tray
                        </button>
                    </form>
                </section>
                <section className={`${styles.card} ${styles.tray}`}>
                    <h2>Shuttles in tray</h2>
                    <ul className={styles.smallCardList}>
                        {tray.map((item) => (
                            <li className={styles.smallCard}>
                                <div className={styles.smallCardText}>
                                    <div className={styles.row}>
                                        <p className={styles.title}>
                                            Shuttle no.
                                        </p>
                                        <p>{item.shuttleNumber}</p>
                                    </div>
                                    <div className={styles.row}>
                                        <p className={styles.title}>
                                            Curr Loc..
                                        </p>
                                        <p>
                                            {`${
                                                [...locations, ...turns].find(
                                                    (loc) =>
                                                        loc._id ===
                                                        item.currentLocation
                                                )?.name
                                            } (${
                                                [...locations, ...turns].find(
                                                    (loc) =>
                                                        loc._id ===
                                                        item.currentLocation
                                                )?.code
                                            })`}
                                        </p>
                                    </div>
                                    <div className={styles.row}>
                                        <p className={styles.title}>Status</p>
                                        <p>{item.status}</p>
                                    </div>
                                </div>
                                <MdOutlineRemoveCircle
                                    className={styles.removeFromTray}
                                    onClick={() =>
                                        handleRemoveFromTray(item.id)
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                    <button
                        type="submit"
                        className={styles.btn}
                        onClick={submitMultiple}
                    >
                        Create Shuttles
                    </button>
                </section>
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
