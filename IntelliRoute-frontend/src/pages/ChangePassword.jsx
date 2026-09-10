import { useState } from "react";
import styles from "./Auth.module.css";
import styles_prof from "./Profile.module.css";
import Popup from "../components/PopUp";
import { AutoRedirect } from "../components/AutoRedirect";

const ChangePassword = () => {
    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    const [updateData, setUpdateData] = useState({
        oldPassword: "",
        confirmNewPassword: "",
        newPassword: "",
    });

    const [formValidity, setFormValidity] = useState({
        oldPassword: false,
        confirmNewPassword: false,
        newPassword: false,
    });

    const validators = {
        oldPassword: (v) =>
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|:;"'<>,.?/]).{6,}$/.test(
                v
            ),
        newPassword: (v) =>
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|:;"'<>,.?/]).{6,}$/.test(
                v
            ),
        confirmNewPassword: (v, updated = null) => {
            if (updated) {
                return (
                    validators.oldPassword(updated.newPassword) &&
                    v === updated.newPassword &&
                    v.length > 0
                );
            }
            return (
                validators.oldPassword(updateData.newPassword) &&
                v === updateData.newPassword &&
                v.length > 0
            );
        },
    };

    const errorMessages = {
        oldPassword:
            "Min 6 chars with letters, numbers and one special character",
        confirmNewPassword: "Passwords do not match",
        newPassword:
            "Min 6 chars with letters, numbers and one special character",
    };

    const handleChange = (field, value) => {
        const updated = { ...updateData, [field]: value };
        setUpdateData(updated);

        // Update validity
        setFormValidity((prev) => ({
            ...prev,
            [field]: validators[field](value),
            confirmNewPassword:
                field === "newPassword" || field === "confirmNewPassword"
                    ? validators.confirmNewPassword(
                          updated.confirmNewPassword,
                          updated
                      )
                    : updated.confirmNewPassword,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const allValid = Object.keys(validators).every((field) =>
            validators[field](updateData[field])
        );
        if (!allValid) {
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>Validation Failed</strong>
                    <p>Please fill all fields correctly.</p>
                </div>
            );
            setIsOpen(true);
            return;
        }

        fetch(import.meta.env.VITE_BACKEND_URL + "/api/users/profile", {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    console.log("Password Changed");
                    setPopUpContent(
                        <div>
                            <strong className={styles.success}>
                                Password Changed
                            </strong>
                        </div>
                    );
                    setRedirectTo("/profile");
                    setIsOpen(true);
                } else {
                    console.error("ERROR : ", data.message);
                    setPopUpContent(
                        <div>
                            <strong className={styles.fail}>
                                {data.message}
                            </strong>
                        </div>
                    );
                    setIsOpen(true);
                }
            })
            .catch((err) => {
                console.error(err);
                setPopUpContent("Some error occured");
                setIsOpen(true);
            });
    };

    const fieldName = (field) => {
        switch (field) {
            case "oldPassword":
                return "Old Password";
            case "newPassword":
                return "New Password";
            case "confirmNewPassword":
                return "Confirm New Password";
            default:
                break;
        }
    };
    return (
        <div className={styles.wrapper}>
            <AutoRedirect/>
            <div className={styles.left}>
                <img src="/login.jpg" alt="auth" className={styles.image} />
            </div>
            <div className={styles.right}>
                <div className={styles.container}>
                    <h2 className={styles["gradient-text"]}>Change Password</h2>
                    <form className={styles.form}>
                        {[
                            "oldPassword",
                            "newPassword",
                            "confirmNewPassword",
                        ].map((field) => (
                            <div className={styles.formField} key={field}>
                                <label className={styles.label}>
                                    {fieldName(field)}
                                </label>
                                <input
                                    type="password"
                                    placeholder={`Enter your ${fieldName(
                                        field
                                    )}`}
                                    value={updateData[field]}
                                    onChange={(e) =>
                                        handleChange(field, e.target.value)
                                    }
                                    className={`${styles.input} ${
                                        updateData[field].length === 0
                                            ? ""
                                            : formValidity[field]
                                            ? styles.valid
                                            : styles.invalid
                                    }`}
                                />
                                {updateData[field].length > 0 &&
                                    !formValidity[field] && (
                                        <span className={styles.errorMsg}>
                                            {errorMessages[field]}
                                        </span>
                                    )}
                            </div>
                        ))}
                    </form>
                    <div className={styles_prof.actionBtns}>
                        <button
                            className={styles_prof.btnPrimary}
                            onClick={handleSubmit}
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>
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
};
export default ChangePassword;
