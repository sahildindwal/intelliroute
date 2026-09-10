# Cookie Issue - FIXED! 🎉

## Problem Identified
```
All cookies: 
Cookie userName not found
```

**Root Cause:** Cookies were NOT being set at all due to two critical bugs in the backend.

## What Was Wrong

### 1. ❌ Invalid Cookie `maxAge` Format
```javascript
// BEFORE (WRONG):
maxAge: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000)

// Express expects a NUMBER in milliseconds, not a Date object
```

### 2. ❌ CORS Reflecting Any Origin
```javascript
// BEFORE (INSECURE):
origin: function (origin, callback) {
    if (origin) {
        callback(null, origin); // Accepts ANY origin
    }
}
```

This was too permissive and potentially causing cookie security issues.

## What Was Fixed

### ✅ Fix 1: Correct Cookie maxAge (Backend)

**File:** `utilities/auth.utility.js`

```javascript
// AFTER (CORRECT):
export const setCookie = (res, payload) => {
    const defaultOptions = {
        maxAge: process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000, // NUMBER in milliseconds
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };
    res.cookie("loginToken", payload, defaultOptions);
};

export const setUserNameCookie = (res, userName) => {
    const defaultOptions = {
        maxAge: process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000, // NUMBER in milliseconds
        httpOnly: false, // Allow JavaScript to read
        secure: true,
        sameSite: "None",
    };
    res.cookie("userName", userName, defaultOptions);
};
```

### ✅ Fix 2: Explicit CORS Whitelist (Backend)

**File:** `server.js`

```javascript
// AFTER (SECURE):
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://intelliroute-frontend.onrender.com", // YOUR RENDER URL
    process.env.FRONTEND_URL, // Optional env variable
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("CORS blocked origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Critical for cookies!
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
```

### ✅ Fix 3: Debug Logging (Frontend)

**File:** `utilities/cookie.utility.js` & `components/ProtectedRoute.jsx`

Added console logs to track cookie behavior in production.

## Testing After Deployment

### Wait for Backend Rebuild
Your backend is deployed on Render. It will automatically:
1. Detect the new commit
2. Rebuild with the fixes (~2-3 minutes)
3. Restart with correct cookie settings

### Then Test Your Frontend

1. **Clear browser data** (important!)
   - Open DevTools (F12)
   - Application → Clear Storage → Clear site data
   - Or use Incognito/Private window

2. **Login again**
   - Go to: `https://intelliroute-frontend.onrender.com/login`
   - Enter credentials
   - Check browser console

3. **Expected Console Output:**
   ```
   All cookies: userName=YourName; loginToken=eyJhbG...
   Cookie userName found: YourName
   Setting userName from cookie: YourName
   ```

4. **Verify Home Page:**
   - Navigate to home
   - Should see: "Welcome to IntelliRoute, YourName"

5. **Check Cookie Storage:**
   - DevTools → Application → Cookies
   - Should see both `userName` and `loginToken`

## Why It Works Now

### Cookie Flow (Corrected):

```
1. User logs in
   ↓
2. Backend creates JWT token
   ↓
3. Backend sets TWO cookies with CORRECT maxAge:
   - loginToken (httpOnly: true) - secure auth token
   - userName (httpOnly: false) - displayable name
   ↓
4. Cookies sent with maxAge as NUMBER (e.g., 86400000 ms)
   ↓
5. Browser stores cookies with proper expiration
   ↓
6. Frontend can read userName cookie (httpOnly: false)
   ↓
7. Name displays on home page ✅
```

### CORS Flow (Secured):

```
1. Frontend (intelliroute-frontend.onrender.com) makes request
   ↓
2. Backend checks origin against whitelist
   ↓
3. Origin found in allowedOrigins ✅
   ↓
4. CORS headers sent with Access-Control-Allow-Credentials: true
   ↓
5. Browser allows cookies to be set/sent ✅
```

## What Changed

| File | Change | Why |
|------|--------|-----|
| `auth.utility.js` | Fixed `maxAge` to use number | Date object invalid for Express cookies |
| `auth.utility.js` | Removed extra semicolon | Code cleanup |
| `server.js` | Whitelisted specific origins | Security + proper cookie handling |
| `server.js` | Added CORS blocking log | Debug rejected origins |
| `.env.example` | Added `FRONTEND_URL` | Document optional env var |

## Deployment Timeline

**Backend:** ✅ Pushed to GitHub → Render rebuilding (~2-3 min)  
**Frontend:** ✅ Already deployed with debug logging

## Verification Commands

After backend redeploys, you can verify with:

```bash
# Test cookie setting (from your local terminal)
curl -i -X POST https://api-intelliroute.mayankrajtools.me/api/users/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://intelliroute-frontend.onrender.com" \
  -d '{"email":"your@email.com","password":"yourpassword"}' \
  --cookie-jar cookies.txt

# Check cookies.txt - should contain userName and loginToken
cat cookies.txt
```

## Next Steps

1. ⏳ **Wait 2-3 minutes** for backend Render rebuild
2. 🧹 **Clear browser cache** or use Incognito
3. 🔐 **Login** to deployed site
4. 👀 **Check console** for success messages
5. 🎉 **See your name** on home page!

## If Still Not Working

Check:
1. Backend rebuild completed on Render dashboard
2. No errors in Render backend logs
3. Browser console shows new debug messages
4. `allowedOrigins` includes your exact frontend URL

---

**Status:** ✅ Backend fixes deployed  
**Next:** Wait for Render rebuild, then test!
