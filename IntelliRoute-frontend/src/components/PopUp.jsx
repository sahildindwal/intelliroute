import { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import styles from "./Popup.module.css";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../GlobalContext";

const Popup = ({
    id = null,
    isOpen,
    cnfOption = false,
    onConfirm = false,
    onClose,
    title,
    redirectTo = false,
    children,
}) => {
    const { state, dispatch } = useContext(GlobalContext);
    const [visible, setVisible] = useState(isOpen);
    const [closing, setClosing] = useState(false);
    const navigate = useNavigate();

    // for redirection to a certain route
    const handleRedirect = () => {
        const path = redirectTo;
        dispatch({ type: "NO_AUTO_REDIRECT" });
        onClose();
        navigate(path);
    };

    // after clicking confirm button if confirm was present
    const handleConfirm = () => {
        onConfirm(id);
    };

    // for closing animation
    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            setClosing(false);
        } else if (visible) {
            setClosing(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setClosing(false);
            }, 200); // match animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen, visible]);

    if (!visible) return null;

    const popupContent = (
        <div
            className={`${styles.overlay} ${closing ? styles.fadeOut : ""}`}
            onClick={onClose}
        >
            <div
                className={`${styles.popup} ${
                    closing ? styles.popupFadeOut : ""
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h3>{title}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className={styles.body}>{children}</div>
                <div className={styles["ctrl-btns"]}>
                    <button className={styles.ctrbtn} onClick={onClose}>
                        CLOSE
                    </button>
                    {redirectTo && (
                        <button
                            className={styles.ctrbtn}
                            onClick={handleRedirect}
                        >
                            REDIRECT
                        </button>
                    )}
                    {cnfOption && (
                        <button
                            className={styles.ctrbtn}
                            onClick={handleConfirm}
                        >
                            CONFIRM
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // Render popup using portal to ensure it's always on top
    return createPortal(popupContent, document.body);
};

export default Popup;
