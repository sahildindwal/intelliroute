import { useState } from "react";
import styles from "./Auth.module.css";
import Popup from "../components/PopUp";
import { AutoRedirect } from "../components/AutoRedirect";

const Register = () => {
    const [redirectTo, setRedirectTo] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [popupContent, setPopUpContent] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
        phone: "",
        adminSecretKey: "",
    });

    const [formValidity, setFormValidity] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
        phone: false,
        adminSecretKey: false,
    });

    const validators = {
        name: (v) => v.trim().length >= 2,
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        password: (v) =>
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|:;"'<>,.?/]).{6,}$/.test(
                v
            ),
        confirmPassword: (v, updated = null) => {
            if (updated) {
                return (
                    validators.password(updated.password) &&
                    v === updated.password &&
                    v.length > 0
                );
            }
            return (
                validators.password(formData.password) &&
                v === formData.password &&
                v.length > 0
            );
        },
        phone: (v) => /^\d{10}$/.test(v),
        adminSecretKey: (v) => v.trim().length >= 8,
    };

    const errorMessages = {
        name: "Name must be at least 2 characters",
        email: "Invalid email address",
        password: "Min 6 chars with letters, numbers and one special character",
        confirmPassword: "Passwords do not match",
        phone: "Phone must be 10 digits",
        adminSecretKey: "Admin secret key must be at least 8 characters",
    };

    const handleChange = (field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);

        // Update validity
        if (field === "role") return;
        setFormValidity((prev) => ({
            ...prev,
            [field]: validators[field](value),
            confirmPassword:
                field === "password" || field === "confirmPassword"
                    ? validators.confirmPassword(
                          updated.confirmPassword,
                          updated
                      )
                    : updated.confirmPassword,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // If admin role, validate secret key
        if (formData.role === "admin" && !validators.adminSecretKey(formData.adminSecretKey)) {
            setPopUpContent(
                <div>
                    <strong className={styles.fail}>Validation Failed</strong>
                    <p>Admin secret key is required and must be at least 8 characters.</p>
                </div>
            );
            setIsOpen(true);
            return;
        }
        
        // Validate other fields (excluding adminSecretKey for students)
        const fieldsToValidate = formData.role === "admin" 
            ? Object.keys(validators)
            : Object.keys(validators).filter(f => f !== "adminSecretKey");
        
        const allValid = fieldsToValidate.every((field) =>
            validators[field](formData[field])
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
        
        const dataToSend = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phone,
            role: formData.role,
        };
        
        // Add admin secret key if registering as admin
        if (formData.role === "admin") {
            dataToSend.adminSecretKey = formData.adminSecretKey;
        }
        fetch(import.meta.env.VITE_BACKEND_URL + "/api/users/register", {
            method: "POST",
            credentials: "include", // cookies will be sent automatically
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    console.log(data.message);
                    setPopUpContent(
                        <div>
                            <strong className={styles.success}>{data.message}</strong>
                            <p>Click Redirect to go to Login page</p>
                        </div>
                    );
                    setRedirectTo("/login");
                    setIsOpen(true);
                } else {
                    console.error("ERROR : ", data.message);
                    setPopUpContent(
                        <div>
                            <strong className={styles.fail}>{data.message}</strong>
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

    const fieldName = (field) =>
        field === "confirmPassword"
            ? "Confirm Password"
            : field.charAt(0).toUpperCase() + field.slice(1);

    // // Redirect after success
    // if (redirect) return <Navigate to="/login" replace />;

    return (
        <div className={styles.wrapper}>
            <AutoRedirect/>
            <div className={styles.left}>
                <img src="/register.png" alt="auth" className={styles.image} />
            </div>
            <div className={styles.right}>
                <div className={styles.container}>
                    <h2 className={styles["gradient-text"]}>
                        Create an Account
                    </h2>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        {[
                            "name",
                            "email",
                            "password",
                            "confirmPassword",
                            "phone",
                        ].map((field) => (
                            <div className={styles.formField} key={field}>
                                <label className={styles.label}>
                                    {fieldName(field)}
                                </label>
                                <input
                                    type={
                                        field.includes("assword")
                                            ? "password"
                                            : "text"
                                    }
                                    placeholder={`Enter your ${fieldName(
                                        field
                                    )}`}
                                    value={formData[field]}
                                    onChange={(e) =>
                                        handleChange(field, e.target.value)
                                    }
                                    className={`${styles.input} ${
                                        formData[field].length === 0
                                            ? ""
                                            : formValidity[field]
                                            ? styles.valid
                                            : styles.invalid
                                    }`}
                                    autoComplete={
                                        field === "name"
                                            ? "name"
                                            : field === "email"
                                            ? "email"
                                            : field.includes("assword")
                                            ? "new-password"
                                            : "tel"
                                    }
                                />
                                {formData[field].length > 0 &&
                                    !formValidity[field] && (
                                        <span className={styles.errorMsg}>
                                            {errorMessages[field]}
                                        </span>
                                    )}
                            </div>
                        ))}

                        <div className={styles.formField}>
                            <label className={styles.label}>Role</label>
                            <select
                                className={`${styles.input} ${styles.select}`}
                                value={formData.role}
                                onChange={(e) =>
                                    handleChange("role", e.target.value)
                                }
                            >
                                <option value="student">Student</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {formData.role === "admin" && (
                            <div className={styles.formField}>
                                <label className={styles.label}>
                                    Admin Secret Key *
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter admin secret key"
                                    value={formData.adminSecretKey}
                                    onChange={(e) =>
                                        handleChange("adminSecretKey", e.target.value)
                                    }
                                    className={`${styles.input} ${
                                        formData.adminSecretKey.length === 0
                                            ? ""
                                            : formValidity.adminSecretKey
                                            ? styles.valid
                                            : styles.invalid
                                    }`}
                                    autoComplete="off"
                                />
                                {formData.adminSecretKey.length > 0 &&
                                    !formValidity.adminSecretKey && (
                                        <span className={styles.errorMsg}>
                                            {errorMessages.adminSecretKey}
                                        </span>
                                    )}
                            </div>
                        )}

                        <button type="submit" className={styles.button}>
                            Register
                        </button>
                    </form>
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
            </div>
        </div>
    );
};

export default Register;
