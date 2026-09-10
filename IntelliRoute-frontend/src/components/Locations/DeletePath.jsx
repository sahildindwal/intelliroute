import { useEffect, useState } from "react";
import styles from "./DeletePath.module.css";
import Popup from "../PopUp";

export function DeletePath() {
    const [paths, setPaths] = useState([]);
    const [selectedPath, setSelectedPath] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [pathToDelete, setPathToDelete] = useState(null);

    const fetchPaths = async () => {
        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/api/locations/paths",
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

            setPaths(data.message);
        } catch (err) {
            console.error(err);
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>Some Error Occurred</strong>
                </div>
            );
            setIsOpen(true);
        }
    };

    useEffect(() => {
        fetchPaths();
    }, []);

    const handleDeleteClick = (path) => {
        setPathToDelete(path);
        setConfirmDelete(true);
    };

    const handleDeleteConfirm = async () => {
        if (!pathToDelete) return;

        try {
            const res = await fetch(
                import.meta.env.VITE_BACKEND_URL + `/api/locations/paths/${pathToDelete._id}`,
                {
                    method: "DELETE",
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
                setConfirmDelete(false);
                return;
            }

            // Success
            setPopUpContent(
                <div>
                    <strong className={styles.success}>Path deleted successfully!</strong>
                </div>
            );
            setIsOpen(true);
            setConfirmDelete(false);
            setPathToDelete(null);
            
            // Refresh the paths list
            fetchPaths();
        } catch (err) {
            console.error(err);
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>Some Error Occurred</strong>
                </div>
            );
            setIsOpen(true);
            setConfirmDelete(false);
        }
    };

    const handleDeleteCancel = () => {
        setConfirmDelete(false);
        setPathToDelete(null);
    };

    const getPathDisplay = (path) => {
        return `${path.node1.name} (${path.node1.code}) ↔ ${path.node2.name} (${path.node2.code})`;
    };

    return (
        <div className={styles.container}>
            <h2>Delete Path</h2>
            <p className={styles.instruction}>
                Select a path to delete. This action cannot be undone.
            </p>

            {paths.length === 0 ? (
                <div className={styles.noData}>
                    <p>No paths available</p>
                </div>
            ) : (
                <div className={styles.pathList}>
                    {paths.map((path) => (
                        <div
                            key={path._id}
                            className={`${styles.pathCard} ${
                                selectedPath?._id === path._id ? styles.selected : ""
                            }`}
                            onClick={() => setSelectedPath(path)}
                        >
                            <div className={styles.pathInfo}>
                                <div className={styles.pathNodes}>
                                    <div className={styles.nodeDetail}>
                                        <span className={styles.nodeLabel}>From:</span>
                                        <span className={styles.nodeName}>
                                            {path.node1.name}
                                        </span>
                                        <span className={styles.nodeCode}>
                                            ({path.node1.code})
                                        </span>
                                    </div>
                                    <div className={styles.pathArrow}>↔</div>
                                    <div className={styles.nodeDetail}>
                                        <span className={styles.nodeLabel}>To:</span>
                                        <span className={styles.nodeName}>
                                            {path.node2.name}
                                        </span>
                                        <span className={styles.nodeCode}>
                                            ({path.node2.code})
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(path);
                                    }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Dialog */}
            {confirmDelete && pathToDelete && (
                <div className={styles.confirmOverlay}>
                    <div className={styles.confirmDialog}>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this path?</p>
                        <div className={styles.pathPreview}>
                            {getPathDisplay(pathToDelete)}
                        </div>
                        <div className={styles.confirmButtons}>
                            <button
                                className={styles.cancelBtn}
                                onClick={handleDeleteCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmBtn}
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pop up content */}
            <Popup
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                }}
                title="ALERT"
            >
                {popupContent}
            </Popup>
        </div>
    );
}
