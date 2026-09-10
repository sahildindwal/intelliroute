# Cookie Troubleshooting Guide

## Issue: Username Not Showing on Deployed Site (Render)

### Current Status
- ✅ Works locally with `npm run dev`
- ❌ Not working on Render deployment
- Both use the same backend API URL

## Root Cause Analysis

The issue is related to **cross-origin cookies** when your frontend and backend are on different domains.

### Cookie Requirements for Cross-Origin

For cookies to work across different domains, the backend must set:

```javascript
// Backend cookie settings (already configured)
{
  httpOnly: false,  // Allow JavaScript to read userName cookie
  secure: true,     // Required for SameSite=None
  sameSite: "None", // Allow cross-origin cookies
  maxAge: 86400000
}
```

### Frontend Requirements

```javascript
// Frontend fetch settings
fetch(API_URL, {
  credentials: "include" // Send cookies with requests
})
```

## Debugging Steps (After Deploy)

### Step 1: Check Browser Console

After the new deployment, open your deployed site and check the browser console (F12):

Look for these debug logs:
```
All cookies: userName=John; token=...
Cookie userName found: John
Setting userName from cookie: John
```

### Step 2: Check Browser Developer Tools

**Application/Storage Tab:**
1. Open DevTools (F12)
2. Go to **Application** → **Cookies**
3. Select your deployed domain: `https://intelliroute-frontend.onrender.com`
4. Check if `userName` cookie exists

**Expected:**
```
Name: userName
Value: YourName
Domain: .onrender.com or .mayankrajtools.me
Path: /
SameSite: None
Secure: ✓
HttpOnly: ✗ (should be unchecked for userName)
```

### Step 3: Check Network Tab

1. Go to **Network** tab
2. Login to your site
3. Find the login request to `/api/users/login`
4. Check **Response Headers** for `Set-Cookie`

**Should see:**
```
Set-Cookie: userName=YourName; Path=/; Secure; SameSite=None
Set-Cookie: token=...; Path=/; Secure; SameSite=None; HttpOnly
```

## Common Issues & Solutions

### Issue 1: Cookies Not Being Set

**Symptom:** No cookies in Application tab after login

**Possible Causes:**
1. Backend CORS not allowing your frontend domain
2. `credentials: "include"` missing in fetch requests

**Solution (Backend):**
```javascript
// server.js or equivalent
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://intelliroute-frontend.onrender.com',
    'https://your-custom-domain.com' // Add your domain
  ],
  credentials: true // CRITICAL!
}));
```

### Issue 2: Cookies Set But Not Readable

**Symptom:** Cookies visible in DevTools but `document.cookie` is empty

**Possible Causes:**
1. `httpOnly: true` on userName cookie (should be false)
2. Different domain/path

**Solution:** Verify backend sets userName with `httpOnly: false`

### Issue 3: Cookies Not Sent with Requests

**Symptom:** Cookies exist but requests fail with 401

**Possible Causes:**
1. Missing `credentials: "include"` in fetch
2. SameSite setting incompatible with browser

**Solution:** Check all API calls have `credentials: "include"`

### Issue 4: Works Locally But Not on Render

**Symptom:** Everything works on localhost but not deployed

**Possible Causes:**
1. **Different cookie domains** - localhost vs render.com
2. **HTTPS requirement** - SameSite=None requires secure: true
3. **CORS origin** - Backend might not allow Render domain

**Solutions:**

**A) Update Backend CORS (MOST LIKELY FIX):**
```javascript
// Add your Render frontend URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://intelliroute-frontend.onrender.com' // ADD THIS
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

**B) Check Environment Variables on Render:**
- Go to Render Dashboard → Your Frontend Service
- **Environment** tab
- Verify: `VITE_BACKEND_URL=https://api-intelliroute.mayankrajtools.me`
- Must match exactly with backend URL

**C) Verify Backend Cookie Domain:**
```javascript
// Backend should NOT set domain for cross-origin
res.cookie('userName', user.name, {
  // NO domain specified = works across origins
  httpOnly: false,
  secure: true,
  sameSite: "None",
  maxAge: 86400000
});
```

## Testing After Fix

### Test Checklist

1. **Deploy Changes:**
   ```bash
   git add .
   git commit -m "Fix cookie issue"
   git push origin main
   ```

2. **Wait for Render Rebuild** (~2-3 minutes)

3. **Clear Browser Data:**
   - Open DevTools (F12)
   - Application → Clear Storage → Clear site data
   - Or use Incognito/Private window

4. **Login Fresh:**
   - Go to deployed site
   - Open DevTools console (see debug logs)
   - Login with your credentials
   - Check console for cookie debug messages

5. **Verify Home Page:**
   - Navigate to home page
   - Should see: "Welcome to IntelliRoute, YourName"

6. **Check Persistence:**
   - Refresh the page (F5)
   - Close and reopen browser
   - Username should still appear

## What The Latest Changes Do

### 1. ProtectedRoute Fix
```javascript
// Now sets userName from cookie after auth check
if (data.success) {
  dispatch({ type: "SET_USER", payload: data.user });
  const userName = getUserNameFromCookie();
  if (userName) {
    dispatch({ type: "SET_USER_NAME", payload: userName });
  }
}
```

### 2. Debug Logging
```javascript
// See what cookies exist
console.log("All cookies:", document.cookie);
console.log("Cookie userName found:", decoded);
console.log("Setting userName from cookie:", userName);
```

## Expected Results

After deployment completes:

**Console Output (Success):**
```
All cookies: userName=John; token=eyJhbGc...
Cookie userName found: John
{email: "...", role: "student", ...}
Setting userName from cookie: John
```

**Console Output (Failure):**
```
All cookies: token=eyJhbGc...
Cookie userName not found
{email: "...", role: "student", ...}
No userName cookie found
```

If you see the failure output, the problem is:
- Backend is not setting the userName cookie
- Or the cookie is httpOnly: true (can't be read by JavaScript)

## Backend Verification

Check your backend `auth.utility.js`:

```javascript
// Should have TWO cookie operations on login:

// 1. Token cookie (httpOnly: true)
res.cookie("token", token, {
  httpOnly: true,  // ✓ Correct
  secure: true,
  sameSite: "None",
  maxAge: 86400000,
});

// 2. UserName cookie (httpOnly: false)
res.cookie("userName", user.name, {
  httpOnly: false, // ✓ MUST be false to read from JavaScript
  secure: true,
  sameSite: "None",
  maxAge: 86400000,
});
```

## Quick Fix Commands

If backend needs updating:

```bash
cd path/to/backend
# Edit utilities/auth.utility.js
# Update CORS in server.js

git add .
git commit -m "Fix CORS and cookie settings for Render deployment"
git push origin main
```

## Still Not Working?

Contact checklist:

1. **Share Console Logs:**
   - Screenshot of browser console after login
   - All cookie debug messages

2. **Share Cookie Storage:**
   - Screenshot of Application → Cookies

3. **Share Network Response:**
   - Screenshot of login response headers (Set-Cookie)

4. **Backend CORS Config:**
   - Share server.js CORS configuration

5. **Environment Variables:**
   - Verify `VITE_BACKEND_URL` on Render dashboard

## Next Steps

1. ✅ Wait for Render to rebuild (automatic, ~2-3 min)
2. ✅ Open deployed site in browser
3. ✅ Open DevTools Console (F12)
4. ✅ Login and watch console logs
5. ✅ Check if userName appears
6. ❓ If still not working, check logs and follow Issue 4 solutions

---

**Last Updated:** After adding debug logging and ProtectedRoute fix
**Status:** Deployed - Waiting for Render rebuild
