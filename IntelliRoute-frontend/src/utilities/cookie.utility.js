/**
 * Get a cookie value by name
 * @param {string} name - The name of the cookie
 * @returns {string|null} - The cookie value or null if not found
 */
export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    console.log("All cookies:", document.cookie); // Debug log
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop().split(';').shift();
        // Decode URL-encoded cookie value
        const decoded = decodeURIComponent(cookieValue);
        console.log(`Cookie ${name} found:`, decoded); // Debug log
        return decoded;
    }
    console.log(`Cookie ${name} not found`); // Debug log
    return null;
};

/**
 * Get the userName from cookie (for same-domain) or localStorage (for cross-domain)
 * @returns {string|null} - The user name or null if not found
 */
export const getUserNameFromCookie = () => {
    // Try cookie first (works locally)
    const cookieName = getCookie('userName');
    if (cookieName) return cookieName;
    
    // Fallback to localStorage (works on deployed static site)
    return localStorage.getItem('userName');
};

/**
 * Set userName in localStorage for cross-domain compatibility
 * @param {string} userName - The user name to store
 */
export const setUserNameInStorage = (userName) => {
    if (userName) {
        localStorage.setItem('userName', userName);
        console.log('Saved userName to localStorage:', userName);
    }
};

/**
 * Clear userName from localStorage
 */
export const clearUserNameFromStorage = () => {
    localStorage.removeItem('userName');
};
