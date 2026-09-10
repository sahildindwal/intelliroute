import styles from "./Footer.module.css";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <div className={styles.brandSection}>
                    <h3 className={styles.brandName}>IntelliRoute</h3>
                    <p className={styles.tagline}>Smart Campus Commuting Solution</p>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.copyrightSection}>
                    <p className={styles.copyright}>
                        © {currentYear} IntelliRoute Team. All rights reserved.
                    </p>
                    <p className={styles.tagline}>
                        Powered by advanced algorithms for optimal transportation
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
